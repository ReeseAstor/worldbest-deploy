"""Billing / Stripe endpoints."""

from __future__ import annotations

import uuid

import stripe
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────


class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str


class PortalRequest(BaseModel):
    return_url: str


class SubscriptionOut(BaseModel):
    plan: str
    stripe_customer_id: str | None = None
    status: str = "active"


class CheckoutOut(BaseModel):
    url: str


class PortalOut(BaseModel):
    url: str


# ── Helpers ──────────────────────────────────────────────────────────────


def _configure_stripe() -> None:
    settings = get_settings()
    stripe.api_key = settings.STRIPE_SECRET_KEY


async def _get_user(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


# ── Endpoints ────────────────────────────────────────────────────────────


@router.post("/billing/checkout", response_model=CheckoutOut)
async def create_checkout_session(
    body: CheckoutRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a Stripe Checkout session for subscription purchase."""
    _configure_stripe()
    user = await _get_user(user_id, db)

    # Create or reuse a Stripe customer
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            metadata={"ember_user_id": str(user.id)},
        )
        user.stripe_customer_id = customer.id
        await db.flush()
    else:
        customer = stripe.Customer.retrieve(user.stripe_customer_id)

    session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        mode="subscription",
        line_items=[{"price": body.price_id, "quantity": 1}],
        success_url=body.success_url,
        cancel_url=body.cancel_url,
        metadata={"ember_user_id": str(user.id)},
    )

    return {"url": session.url}


@router.post("/billing/portal", response_model=PortalOut)
async def create_portal_session(
    body: PortalRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a Stripe Customer Portal session."""
    _configure_stripe()
    user = await _get_user(user_id, db)

    if not user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billing account found. Please subscribe first.",
        )

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=body.return_url,
    )

    return {"url": session.url}


@router.post("/billing/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle Stripe webhook events."""
    settings = get_settings()
    _configure_stripe()

    body = await request.body()

    if not stripe_signature or not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing signature or webhook secret",
        )

    try:
        event = stripe.Webhook.construct_event(
            payload=body,
            sig_header=stripe_signature,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )

    # ── Handle relevant events ────────────────────────────────────────
    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        ember_user_id = data_object.get("metadata", {}).get("ember_user_id")
        if ember_user_id:
            result = await db.execute(
                select(User).where(User.id == uuid.UUID(ember_user_id))
            )
            user = result.scalar_one_or_none()
            if user:
                user.plan = "pro"
                await db.flush()

    elif event_type == "customer.subscription.deleted":
        customer_id = data_object.get("customer")
        if customer_id:
            result = await db.execute(
                select(User).where(User.stripe_customer_id == customer_id)
            )
            user = result.scalar_one_or_none()
            if user:
                user.plan = "starter"
                await db.flush()

    elif event_type == "customer.subscription.updated":
        customer_id = data_object.get("customer")
        status_value = data_object.get("status")
        if customer_id:
            result = await db.execute(
                select(User).where(User.stripe_customer_id == customer_id)
            )
            user = result.scalar_one_or_none()
            if user and status_value == "active":
                user.plan = "pro"
                await db.flush()

    return {"status": "ok"}


@router.get("/billing/subscription", response_model=SubscriptionOut)
async def get_subscription(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return the current user's subscription info."""
    user = await _get_user(user_id, db)
    return {
        "plan": user.plan,
        "stripe_customer_id": user.stripe_customer_id,
        "status": "active",
    }
