CREATE TABLE IF NOT EXISTS log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(255),
    type VARCHAR(255),
    description TEXT,
    data TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
