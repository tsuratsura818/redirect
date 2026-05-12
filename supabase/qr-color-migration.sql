-- QR コードに色設定カラムを追加
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS qr_color_dark VARCHAR(9) NOT NULL DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS qr_color_light VARCHAR(9) NOT NULL DEFAULT '#ffffff';

COMMENT ON COLUMN qr_codes.qr_color_dark IS 'QRコードの前景色 (#RRGGBB or #RRGGBBAA)';
COMMENT ON COLUMN qr_codes.qr_color_light IS 'QRコードの背景色 (#RRGGBB or #RRGGBBAA)';
