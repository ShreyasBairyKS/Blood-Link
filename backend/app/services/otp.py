import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("bloodlink.otp")
logger.setLevel(logging.INFO)
if not logger.handlers:
    # Uvicorn doesn't configure the root logger, so INFO-level messages here would
    # otherwise be silently dropped — this is the only way the dev OTP code is visible.
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(levelname)s:%(name)s: %(message)s"))
    logger.addHandler(_handler)


class OTPProvider(ABC):
    @abstractmethod
    async def send(self, phone: str, code: str) -> None: ...


class ConsoleOTPProvider(OTPProvider):
    """Dev-only provider: logs the OTP instead of sending a real SMS/WhatsApp message.

    Swap for an MSG91/Twilio-backed provider (DLT-registered templates) before launch.
    """

    async def send(self, phone: str, code: str) -> None:
        logger.info("OTP for %s: %s", phone, code)


def get_otp_provider(provider_name: str) -> OTPProvider:
    if provider_name == "console":
        return ConsoleOTPProvider()
    raise ValueError(f"Unknown OTP provider: {provider_name}")
