-- TAKE IT Food Delivery - sample demo data
-- IMPORTANT:
-- This script assumes the table/column names shown below. Run AFTER schema creation.
-- Update names/columns to match your actual JPA entities before importing.
-- All records are fictional. Do not add real customer data, passwords, or API keys.

INSERT INTO restaurants
    (id, name, description, address, city, pincode, active)
VALUES
    (1, 'Spice Garden', 'Indian favorites and homestyle meals', '12 Demo Market Road', 'Mumbai', '400001', TRUE),
    (2, 'Green Bowl', 'Fresh vegetarian meals and snacks', '24 Sample Avenue', 'Thane', '400601', TRUE),
    (3, 'Burger Station', 'Burgers, fries, and quick bites', '8 Fictional Street', 'Kalyan', '421301', TRUE);

INSERT INTO categories
    (id, name, restaurant_id, active)
VALUES
    (1, 'Main Course', 1, TRUE),
    (2, 'Breads', 1, TRUE),
    (3, 'Beverages', 1, TRUE),
    (4, 'Healthy Meals', 2, TRUE),
    (5, 'Snacks', 2, TRUE),
    (6, 'Burgers', 3, TRUE),
    (7, 'Sides', 3, TRUE);

INSERT INTO dishes
    (id, name, description, price, discounted_price, image_url, vegetarian, available, category_id)
VALUES
    (1, 'Paneer Butter Masala', 'Paneer in a creamy tomato gravy', 260.00, 229.00, NULL, TRUE, TRUE, 1),
    (2, 'Chicken Biryani', 'Fragrant rice with aromatic spices and chicken', 320.00, NULL, NULL, FALSE, TRUE, 1),
    (3, 'Butter Naan', 'Soft naan brushed with butter', 55.00, NULL, NULL, TRUE, TRUE, 2),
    (4, 'Masala Chai', 'Indian tea with ginger and spices', 40.00, NULL, NULL, TRUE, TRUE, 3),
    (5, 'Quinoa Veg Bowl', 'Quinoa with seasonal vegetables', 210.00, 189.00, NULL, TRUE, TRUE, 4),
    (6, 'Veg Sandwich', 'Toasted sandwich with fresh vegetables', 120.00, NULL, NULL, TRUE, TRUE, 5),
    (7, 'Classic Veg Burger', 'Vegetable patty with lettuce and sauce', 150.00, NULL, NULL, TRUE, TRUE, 6),
    (8, 'French Fries', 'Crispy golden potato fries', 100.00, NULL, NULL, TRUE, TRUE, 7);

-- Demo users and orders are intentionally omitted because their required columns,
-- role values, password hashing, and ownership relationships depend on your code.
-- Create demo accounts through registration, or add inserts matching your entities.
