"""Errores de dominio y respuestas RFC 9457 (application/problem+json)."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Error controlado de la aplicación con status HTTP y código estable."""

    def __init__(self, status: int, code: str, detail: str, *, extras: dict | None = None):
        self.status = status
        self.code = code
        self.detail = detail
        self.extras = extras or {}
        super().__init__(detail)


def problem(status: int, title: str, detail: str, *, code: str = "bad_request", extras: dict | None = None) -> dict:
    body: dict = {
        "type": "about:blank",
        "title": title,
        "status": status,
        "code": code,
        "detail": detail,
    }
    body.update(extras or {})
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_req: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status,
            content=problem(
                exc.status,
                _TITLES.get(exc.status, "Error"),
                exc.detail,
                code=exc.code,
                extras=exc.extras,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_req: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [{"loc": [str(x) for x in e["loc"]], "msg": e["msg"]} for e in exc.errors()]
        return JSONResponse(
            status_code=422,
            content=problem(
                422,
                "Solicitud no válida",
                "Los datos enviados no pasan la validación.",
                code="validation_error",
                extras={"errors": errors},
            ),
        )

    @app.exception_handler(HTTPException)
    async def _http_error(_req: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=problem(exc.status_code, _TITLES.get(exc.status_code, "Error"), str(exc.detail)),
        )


_TITLES = {
    400: "Solicitud incorrecta",
    401: "No autenticado",
    403: "Acceso denegado a la zona",
    404: "No encontrado",
    409: "Conflicto",
    413: "Archivo demasiado grande",
    422: "Solicitud no válida",
    429: "Demasiadas solicitudes",
    500: "Error interno",
}