# Database Audit Report

## 1. Tables Overview
Total Tables: 24
- addresses
- batch_test_results
- batches
- cart_items
- coupons
- faqs
- feedback
- inventory_logs
- login_histories
- order_items
- order_status_history
- orders
- otps
- payments
- product_images
- product_metadata
- products
- profiles
- report_access_logs
- returns
- shipment_updates
- shipments
- site_settings
- skus

## 2. Table Schemas & Data Counts

### Table: addresses
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| profile_id | uuid | YES |  |
| full_name | text | NO |  |
| phone | text | NO |  |
| address_line1 | text | NO |  |
| address_line2 | text | YES |  |
| city | text | NO |  |
| state | text | NO |  |
| pincode | text | NO |  |
| is_default | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

### Table: batch_test_results
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| batch_id | uuid | YES |  |
| parameter | text | NO |  |
| value | text | NO |  |
| limit_val | text | YES |  |
| status | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### Table: batches
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| product_id | uuid | YES |  |
| batch_number | text | NO |  |
| mfg_date | date | YES |  |
| exp_date | date | YES |  |
| report_pdf_url | text | YES |  |
| created_at | timestamp with time zone | YES | now() |

### Table: cart_items
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| profile_id | uuid | YES |  |
| sku_id | uuid | YES |  |
| quantity | integer | YES | 1 |
| created_at | timestamp with time zone | YES | now() |

### Table: coupons
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| code | text | NO |  |
| discount_type | text | NO |  |
| discount_value | integer | NO |  |
| min_order_value | integer | YES | 0 |
| usage_limit | integer | YES |  |
| used_count | integer | YES | 0 |
| expires_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | YES | now() |

### Table: faqs
Row Count: 1
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| product_id | uuid | YES |  |
| question | text | NO |  |
| answer | text | NO |  |
| display_order | integer | YES | 0 |
| is_active | boolean | YES | true |

### Table: feedback
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| profile_id | uuid | YES |  |
| product_id | uuid | YES |  |
| rating | integer | YES |  |
| comment | text | YES |  |
| is_published | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

### Table: inventory_logs
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| sku_id | uuid | YES |  |
| quantity_change | integer | NO |  |
| reason | text | NO |  |
| created_at | timestamp with time zone | YES | now() |

### Table: login_histories
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| profile_id | uuid | YES |  |
| ip_address | text | YES |  |
| user_agent | text | YES |  |
| login_at | timestamp with time zone | YES | now() |

### Table: order_items
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | YES |  |
| sku_id | uuid | YES |  |
| quantity | integer | NO |  |
| unit_price | integer | NO |  |
| created_at | timestamp with time zone | YES | now() |

### Table: order_status_history
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | YES |  |
| status | text | NO |  |
| comment | text | YES |  |
| created_at | timestamp with time zone | YES | now() |

### Table: orders
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| profile_id | uuid | YES |  |
| order_number | text | NO |  |
| total_amount | integer | NO |  |
| discount_amount | integer | YES | 0 |
| coupon_id | uuid | YES |  |
| current_status | text | YES | 'pending'::text |
| shipping_address_id | uuid | YES |  |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### Table: otps
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| profile_id | uuid | YES |  |
| phone_or_email | text | NO |  |
| code | text | NO |  |
| type | text | NO |  |
| expires_at | timestamp with time zone | NO |  |
| is_used | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

### Table: payments
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | YES |  |
| provider | text | YES | 'Razorpay'::text |
| transaction_id | text | YES |  |
| method | text | YES |  |
| amount | integer | NO |  |
| status | text | YES | 'pending'::text |
| raw_response | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |

### Table: product_images
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| product_id | uuid | YES |  |
| image_url | text | NO |  |
| display_order | integer | YES | 0 |
| is_main | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

### Table: product_metadata
Row Count: 2
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| product_id | uuid | YES |  |
| category | text | NO |  |
| key | text | NO |  |
| value | text | NO |  |
| icon_name | text | YES |  |
| display_order | integer | YES | 0 |

### Table: products
Row Count: 1
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| name | text | NO |  |
| slug | text | NO |  |
| description | text | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### Table: profiles
Row Count: 1
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO |  |
| full_name | text | YES |  |
| phone | text | YES |  |
| loyalty_points | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### Table: report_access_logs
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| batch_number | text | NO |  |
| ip_address | text | YES |  |
| profile_id | uuid | YES |  |
| accessed_at | timestamp with time zone | YES | now() |

### Table: returns
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | YES |  |
| reason | text | YES |  |
| status | text | YES | 'requested'::text |
| refund_amount | integer | YES |  |
| created_at | timestamp with time zone | YES | now() |

### Table: shipment_updates
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| shipment_id | uuid | YES |  |
| status | text | NO |  |
| location | text | YES |  |
| updated_at | timestamp with time zone | YES | now() |

### Table: shipments
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| order_id | uuid | YES |  |
| courier_name | text | YES |  |
| tracking_id | text | YES |  |
| label_url | text | YES |  |
| status | text | YES | 'preparing'::text |
| estimated_delivery | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | YES | now() |

### Table: site_settings
Row Count: 0
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| key | text | NO |  |
| value | text | NO |  |
| description | text | YES |  |

### Table: skus
Row Count: 2
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| product_id | uuid | YES |  |
| sku_code | text | NO |  |
| label | text | NO |  |
| price | integer | NO |  |
| stock | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## 3. Foreign Key Relationships
| Table | Column | References | Foreign Column |
|---|---|---|---|
| addresses | profile_id | profiles | id |
| batch_test_results | batch_id | batches | id |
| batches | product_id | products | id |
| cart_items | sku_id | skus | id |
| cart_items | profile_id | profiles | id |
| faqs | product_id | products | id |
| feedback | product_id | products | id |
| feedback | profile_id | profiles | id |
| inventory_logs | sku_id | skus | id |
| login_histories | profile_id | profiles | id |
| order_items | order_id | orders | id |
| order_items | sku_id | skus | id |
| order_status_history | order_id | orders | id |
| orders | shipping_address_id | addresses | id |
| orders | coupon_id | coupons | id |
| orders | profile_id | profiles | id |
| otps | profile_id | profiles | id |
| payments | order_id | orders | id |
| product_images | product_id | products | id |
| product_metadata | product_id | products | id |
| report_access_logs | profile_id | profiles | id |
| returns | order_id | orders | id |
| shipment_updates | shipment_id | shipments | id |
| shipments | order_id | orders | id |
| skus | product_id | products | id |
