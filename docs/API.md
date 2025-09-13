# API Documentation (excluding Auth Register/Login)

Base URL: `http://localhost:5000`

- Orders routes are protected with Bearer JWT.
- Products routes are public.

## Authorization
For protected endpoints add this header:

- `Authorization: Bearer <JWT_TOKEN>`

---

## Orders
Route prefix: `/api/orders`

- POST `/api/orders`
  - Purpose: Create a new order. Supports optional image upload.
  - Content types:
    - `application/json` (no image)
    - `multipart/form-data` (use field `orderImage` for file)
  - Body fields:
    - `customerName` string (required)
    - `deliveryDate` string (ISO date, required)
    - `items` array (required, non-empty). Each item:
      - `product` string (required; controller maps to `category`)
      - `sizes` object size -> `{ quantity:number, price:number }` (required)
    - `orderType` string (optional, default `walk-in`)
    - `phone` string (optional)
    - `email` string (optional)
    - `orderImage` file (optional, multipart only)
  - Responses:
    - 201 `{ message: "Order created successfully", order }`
    - 400 `{ message }` validation error
    - 500 `{ message: "Server Error", error }`

- GET `/api/orders`
  - Purpose: List all orders
  - Responses:
    - 200 `[ order, ... ]`
    - 500 server error

- GET `/api/orders/:id`
  - Purpose: Get an order by ID
  - Responses:
    - 200 `order`
    - 404 `{ message: "Order not found" }`
    - 500 server error

- PUT `/api/orders/:id`
  - Purpose: Update an order (send fields to change)
  - Body: any subset of order fields, including `status`
  - Responses:
    - 200 `{ message: "Order updated successfully", order }`
    - 404 `{ message: "Order not found" }`
    - 500 server error

- DELETE `/api/orders/:id`
  - Purpose: Delete an order
  - Responses:
    - 200 `{ message: "Order deleted successfully" }`
    - 404 `{ message: "Order not found" }`
    - 500 server error

Examples

Create (JSON):
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "deliveryDate": "2025-09-30",
    "orderType": "walk-in",
    "items": [
      {
        "product": "T-Shirt",
        "sizes": {
          "M": { "quantity": 10, "price": 200 },
          "L": { "quantity": 5, "price": 220 }
        }
      }
    ],
    "phone": "9998887777",
    "email": "john@example.com"
  }'
```

Create (with image):
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -F "orderImage=@/path/to/image.jpg" \
  -F 'customerName=John Doe' \
  -F 'deliveryDate=2025-09-30' \
  -F 'items=[{"product":"T-Shirt","sizes":{"M":{"quantity":10,"price":200}}}]'
```

---

## Products
Route prefix: `/api/products`

- POST `/api/products`
  - Purpose: Create a product configuration
  - Body (application/json):
    - `name` string (required, unique)
    - `sizes` string[] (required)
    - `details` array of `{ label: string, key: string, options: string[] }`
  - Responses:
    - 201 `product`
    - 500 server error

- GET `/api/products`
  - Purpose: List all products
  - Responses:
    - 200 `[ product, ... ]`
    - 500 server error

- GET `/api/products/:id`
  - Purpose: Get a product by ID
  - Responses:
    - 200 `product`
    - 404 `{ message: "Product not found" }`
    - 500 server error

- PUT `/api/products/:id`
  - Purpose: Update a product
  - Body: any subset of `{ name, sizes, details }`
  - Responses:
    - 200 `product`
    - 404 `{ message: "Product not found" }`
    - 500 server error

- DELETE `/api/products/:id`
  - Purpose: Delete a product
  - Responses:
    - 200 `{ message: "Product deleted" }`
    - 404 `{ message: "Product not found" }`
    - 500 server error

- PATCH `/api/products/:productName/options`
  - Purpose: Add a new option to a detail field of a product
  - Body:
    - `detailKey` string (required)
    - `option` string (required; must be new)
  - Responses:
    - 200 `product`
    - 400 `{ message }` bad request or option exists
    - 404 `{ message }` product or detail not found
    - 500 server error

Examples

Create product:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "T-Shirt",
    "sizes": ["S","M","L","XL"],
    "details": [
      { "label": "Color", "key": "color", "options": ["Red","Blue"] },
      { "label": "Fabric", "key": "fabric", "options": ["Cotton","Polyester"] }
    ]
  }'
```

Add option:
```bash
curl -X PATCH http://localhost:5000/api/products/T-Shirt/options \
  -H "Content-Type: application/json" \
  -d '{ "detailKey": "color", "option": "Black" }'
```

---

## Notes
- Orders controller currently maps each item `product` into `order.items[].category` when persisting.
- The `Order` model also has fields `mobileNumber`, `product`, `orderDescription`, `orderImage` that may not be set by the current controller unless provided or wired. The documented behavior reflects the current controller logic.
