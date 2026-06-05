"""
Sin tablas propias: `reports_service` agrega datos de otros modelos.

Fuentes por función del service:
  - dashboard_summary          → Order, WasteRecord, Product, InventoryMovement
  - financial_daily_range      → Order, OrderItem, Recipe, WasteRecord
  - recipe_margin_ranking      → Recipe, RecipeIngredient, Product
  - supplier_spend_summary     → InventoryMovement (IN), Product, Supplier
  - export_report_csv          → según kind: inventory | sales | waste | orders

No hay tablas dedicadas en la BD: `reports_service` agrega datos desde
`orders`, `order_items`, `inventory_movements`, `waste_records`, `products`
y `recipes`. Importar esos modelos desde sus módulos correspondientes.
"""
