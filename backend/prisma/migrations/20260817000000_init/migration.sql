-- CreateTable
CREATE TABLE `tienda` (
    `id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` CHAR(36) NOT NULL,
    `tienda_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `correo` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('DUENO', 'OPERADOR') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `usuario_correo_key`(`correo`),
    UNIQUE INDEX `usuario_id_tienda_id_key`(`id`, `tienda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto` (
    `id` CHAR(36) NOT NULL,
    `tienda_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `categoria` VARCHAR(100) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `producto_id_tienda_id_key`(`id`, `tienda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venta` (
    `id` CHAR(36) NOT NULL,
    `tienda_id` CHAR(36) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `origen` ENUM('MANUAL', 'VOZ') NOT NULL,
    `anulada` BOOLEAN NOT NULL DEFAULT false,
    `fecha` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `venta_id_tienda_id_key`(`id`, `tienda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_venta` (
    `id` CHAR(36) NOT NULL,
    `tienda_id` CHAR(36) NOT NULL,
    `venta_id` CHAR(36) NOT NULL,
    `producto_id` CHAR(36) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `detalle_venta_venta_id_idx`(`venta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factura` (
    `id` CHAR(36) NOT NULL,
    `tienda_id` CHAR(36) NOT NULL,
    `venta_id` CHAR(36) NOT NULL,
    `folio` VARCHAR(50) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `estado` ENUM('EMITIDA', 'ANULADA') NOT NULL DEFAULT 'EMITIDA',
    `leyenda` VARCHAR(255) NOT NULL DEFAULT 'Documento simulado, sin validez fiscal',
    `fecha_emision` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `factura_venta_id_key`(`venta_id`),
    UNIQUE INDEX `factura_folio_key`(`folio`),
    UNIQUE INDEX `factura_id_tienda_id_key`(`id`, `tienda_id`),
    UNIQUE INDEX `factura_venta_id_tienda_id_key`(`venta_id`, `tienda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comando_voz` (
    `id` CHAR(36) NOT NULL,
    `tienda_id` CHAR(36) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `texto_transcrito` TEXT NOT NULL,
    `intencion_detectada` VARCHAR(100) NULL,
    `entidades_extraidas` JSON NULL,
    `resultado` ENUM('EJECUTADO', 'RECHAZADO', 'PENDIENTE_CONFIRMACION') NOT NULL,
    `fecha` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_tienda_id_fkey` FOREIGN KEY (`tienda_id`) REFERENCES `tienda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_tienda_id_fkey` FOREIGN KEY (`tienda_id`) REFERENCES `tienda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venta` ADD CONSTRAINT `venta_tienda_id_fkey` FOREIGN KEY (`tienda_id`) REFERENCES `tienda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venta` ADD CONSTRAINT `venta_usuario_id_tienda_id_fkey` FOREIGN KEY (`usuario_id`, `tienda_id`) REFERENCES `usuario`(`id`, `tienda_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_venta` ADD CONSTRAINT `detalle_venta_tienda_id_fkey` FOREIGN KEY (`tienda_id`) REFERENCES `tienda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_venta` ADD CONSTRAINT `detalle_venta_venta_id_tienda_id_fkey` FOREIGN KEY (`venta_id`, `tienda_id`) REFERENCES `venta`(`id`, `tienda_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_venta` ADD CONSTRAINT `detalle_venta_producto_id_tienda_id_fkey` FOREIGN KEY (`producto_id`, `tienda_id`) REFERENCES `producto`(`id`, `tienda_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factura` ADD CONSTRAINT `factura_tienda_id_fkey` FOREIGN KEY (`tienda_id`) REFERENCES `tienda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factura` ADD CONSTRAINT `factura_venta_id_tienda_id_fkey` FOREIGN KEY (`venta_id`, `tienda_id`) REFERENCES `venta`(`id`, `tienda_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comando_voz` ADD CONSTRAINT `comando_voz_tienda_id_fkey` FOREIGN KEY (`tienda_id`) REFERENCES `tienda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comando_voz` ADD CONSTRAINT `comando_voz_usuario_id_tienda_id_fkey` FOREIGN KEY (`usuario_id`, `tienda_id`) REFERENCES `usuario`(`id`, `tienda_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
