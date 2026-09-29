import logging

import pytest

from app.services.otp import ConsoleOTPProvider, get_otp_provider


@pytest.mark.asyncio
async def test_console_otp_provider_logs_code(caplog):
    provider = ConsoleOTPProvider()

    with caplog.at_level(logging.INFO, logger="bloodlink.otp"):
        await provider.send("+911234567890", "654321")

    assert "654321" in caplog.text
    assert "+911234567890" in caplog.text


def test_otp_logger_prints_without_relying_on_root_logging_config():
    # caplog.at_level() masks logger-configuration bugs by patching handlers/levels
    # for the test — this checks the logger's *own* config is enough on a bare run,
    # since that's what actually determines whether `uvicorn app.main:app` prints the OTP.
    logger = logging.getLogger("bloodlink.otp")
    assert logger.level == logging.INFO
    assert logger.handlers, "logger needs its own handler — nothing else configures the root logger"


def test_get_otp_provider_returns_console_provider():
    provider = get_otp_provider("console")
    assert isinstance(provider, ConsoleOTPProvider)


def test_get_otp_provider_raises_on_unknown_provider():
    with pytest.raises(ValueError):
        get_otp_provider("msg91")
