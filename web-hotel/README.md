# Floki Web Hotel (Staff UI)

Hotel staff dashboard aligned with client app style. Includes:
- Orders: View and update order statuses.
- Menu: Create, edit, and delete menu items.
- Sales: Revenue and order analytics with date filters.

## Run
- Ensure backend is running on port 5000.
- Start the staff UI on port 3002:

```
npm start
```

If using the workspace Tasks: run "frontend:web-hotel".

## API
- Orders: /api/hotel/orders (GET, POST, PUT `/:id`)
- Menu: /api/admin/menu (GET, POST, PUT `/:id`, DELETE `/:id`)

A CRA proxy forwards to http://localhost:5000.