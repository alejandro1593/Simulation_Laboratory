"""Crear esquema inicial (usuarios, refresco, progreso, favoritos y auditoría).

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-12
"""
from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.core.db import Base

    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    from app.core.db import Base

    Base.metadata.drop_all(bind=op.get_bind())