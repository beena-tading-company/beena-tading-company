const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Website की files चलाने के लिए
app.use(express.static(__dirname));

const PORT = 5000;

// Orders रखने वाली file
const ordersFile = path.join(__dirname, "orders.json");

// अगर orders.json नहीं है तो बना दें
if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, "[]", "utf8");
}

// सभी orders पढ़ना
function getOrders() {
    try {
        const data = fs.readFileSync(ordersFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// सभी orders save करना
function saveOrders(orders) {
    fs.writeFileSync(
        ordersFile,
        JSON.stringify(orders, null, 2),
        "utf8"
    );
}

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Beena Trading Company server is working"
    });
});

// सभी orders प्राप्त करना
app.get("/api/orders", (req, res) => {
    const orders = getOrders();
    res.json(orders);
});

// नया order बनाना
app.post("/api/orders", (req, res) => {

    const orders = getOrders();

    const order = {
        id: "BTC-" + Date.now(),
        customer: req.body.customer || {},
        items: req.body.items || [],
        total: Number(req.body.total || 0),
        payment: req.body.payment || "COD",
        status: "Pending",
        date: new Date().toISOString()
    };

    orders.push(order);
    saveOrders(orders);

    res.json({
        success: true,
        message: "Order placed successfully",
        order: order
    });
});

// Order का status बदलना
app.put("/api/orders/:id/status", (req, res) => {

    const orders = getOrders();

    const order = orders.find(
        item => item.id === req.params.id
    );

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }

    order.status = req.body.status || "Pending";

    saveOrders(orders);

    res.json({
        success: true,
        order: order
    });
});

// Server start
app.listen(PORT, () => {
    console.log(
        `Beena Trading Company running at http://localhost:${PORT}`
    );
});