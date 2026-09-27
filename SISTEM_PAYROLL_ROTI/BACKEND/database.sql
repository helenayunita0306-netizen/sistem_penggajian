-- =====================================================
-- BREADPAY
-- SISTEM PENGGAJIAN & INSENTIF PABRIK ROTI
-- =====================================================

-- Hapus tabel lama jika ada
DROP TABLE IF EXISTS penggajian CASCADE;
DROP TABLE IF EXISTS insentif CASCADE;
DROP TABLE IF EXISTS karyawan CASCADE;


-- =====================================================
-- 1. TABEL KARYAWAN
-- =====================================================

CREATE TABLE karyawan (
    id_karyawan SERIAL PRIMARY KEY,
    nama_karyawan VARCHAR(100) NOT NULL,
    jabatan VARCHAR(50) NOT NULL,
    gaji_pokok NUMERIC(15,2) NOT NULL CHECK (gaji_pokok >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 2. TABEL INSENTIF
-- =====================================================

CREATE TABLE insentif (
    id_insentif SERIAL PRIMARY KEY,

    id_karyawan INT NOT NULL,

    jenis_insentif VARCHAR(100) NOT NULL,

    jumlah_produksi INT NOT NULL
        CHECK (jumlah_produksi >= 0),

    tarif_insentif NUMERIC(15,2) NOT NULL
        CHECK (tarif_insentif >= 0),

    total_insentif NUMERIC(15,2) NOT NULL
        CHECK (total_insentif >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_insentif_karyawan
        FOREIGN KEY (id_karyawan)
        REFERENCES karyawan(id_karyawan)
        ON DELETE CASCADE
);


-- =====================================================
-- 3. TABEL PENGGAJIAN
-- =====================================================

CREATE TABLE penggajian (
    id_penggajian SERIAL PRIMARY KEY,

    id_karyawan INT NOT NULL,

    periode_gaji VARCHAR(30) NOT NULL,

    total_jam_kerja INT NOT NULL
        CHECK (total_jam_kerja >= 0),

    total_gaji NUMERIC(15,2) NOT NULL
        CHECK (total_gaji >= 0),

    tanggal_penggajian DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_penggajian_karyawan
        FOREIGN KEY (id_karyawan)
        REFERENCES karyawan(id_karyawan)
        ON DELETE CASCADE
);