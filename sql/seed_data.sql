USE lab_product;
-- Exécuter une seule fois sur une base vide.
INSERT INTO categories(name) VALUES ('Électronique'),('Livres'),('Vêtements');
INSERT INTO products(name,price,category_id) SELECT 'Smartphone',699.99,id FROM categories WHERE name='Électronique';
INSERT INTO products(name,price,category_id) SELECT 'Roman',14.99,id FROM categories WHERE name='Livres';
INSERT INTO products(name,price,category_id) SELECT 'T-shirt',19.99,id FROM categories WHERE name='Vêtements';
