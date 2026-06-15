import logging

from config.middleware.request_id import request_id_var


class RequestIDLogFilter(logging.Filter):
    """
    Enrich log records with a request id when available.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True
