"""Permisos de rutas y funcionalidades por rol."""

from sqlalchemy.orm import Session

from app.models.config_model import PermissionFeature, RoleFeaturePermission, RoutePermission
from app.services.serializers import enum_val


ROLE_HOME = {
    "ADMIN": "/",
    "MANAGER": "/",
    "CHEF": "/recetas",
    "WAITER": "/inventario",
}

ROLE_LABELS = {
    "ADMIN": "Administrador",
    "MANAGER": "Gerente",
    "CHEF": "Chef",
    "WAITER": "Mesero/a",
}


def get_permissions_config(db: Session) -> dict:
    route_rows = db.query(RoutePermission).all()
    routes: dict[str, list[str]] = {}
    for row in route_rows:
        path = row.path
        role = enum_val(row.role)
        routes.setdefault(path, []).append(role)

    features_rows = (
        db.query(PermissionFeature, RoleFeaturePermission)
        .outerjoin(
            RoleFeaturePermission,
            RoleFeaturePermission.feature_key == PermissionFeature.key,
        )
        .order_by(PermissionFeature.sort_order)
        .all()
    )

    features: dict[str, dict] = {}
    for feature, perm in features_rows:
        if feature.key not in features:
            features[feature.key] = {
                "label": feature.label,
                "roles": {role: False for role in ROLE_LABELS},
            }
        if perm is not None:
            features[feature.key]["roles"][enum_val(perm.role)] = perm.allowed

    return {
        "routes": routes,
        "features": features,
        "role_home": ROLE_HOME,
        "role_labels": ROLE_LABELS,
    }
