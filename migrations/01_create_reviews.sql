-- =============================================================
-- WellForged Dynamic Reviews Table
-- =============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INT REFERENCES products(id) ON DELETE CASCADE,
    profile_id  INT REFERENCES profiles(id) ON DELETE SET NULL,
    order_id    INT REFERENCES orders(id), 
    rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    highlight   VARCHAR(200),
    comment     TEXT,
    is_verified BOOLEAN DEFAULT true,
    status      VARCHAR(20) DEFAULT 'approved', -- Auto-approving for initial rollout
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);
