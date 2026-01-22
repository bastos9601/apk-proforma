/**
 * Script para generar iconos en diferentes tamaños
 * Requiere: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = './assets/bradatec.png';
const outputDir = './assets';

// Tamaños necesarios para Expo
const sizes = {
  'icon.png': 1024,           // Icono principal
  'adaptive-icon.png': 1024,  // Android adaptativo
  'splash.png': 1284,         // Splash screen (se centrará en 1284x2778)
};

async function generateIcons() {
  try {
    console.log('🎨 Generando iconos...\n');

    // Verificar que existe la imagen original
    if (!fs.existsSync(inputImage)) {
      console.error('❌ Error: No se encuentra bradatec.png en assets/');
      return;
    }

    // Generar cada tamaño
    for (const [filename, size] of Object.entries(sizes)) {
      const outputPath = path.join(outputDir, filename);
      
      if (filename === 'splash.png') {
        // Para splash, crear una imagen más grande con el logo centrado
        await sharp({
          create: {
            width: 1284,
            height: 2778,
            channels: 4,
            background: { r: 37, g: 99, b: 235, alpha: 1 } // #2563eb
          }
        })
        .composite([{
          input: await sharp(inputImage)
            .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toBuffer(),
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath);
      } else {
        // Para iconos normales
        await sharp(inputImage)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      }
      
      console.log(`✅ Generado: ${filename} (${size}x${size})`);
    }

    console.log('\n🎉 ¡Iconos generados exitosamente!');
    console.log('\nArchivos creados:');
    console.log('  - icon.png (1024x1024)');
    console.log('  - adaptive-icon.png (1024x1024)');
    console.log('  - splash.png (1284x2778)');
    
  } catch (error) {
    console.error('❌ Error al generar iconos:', error.message);
  }
}

generateIcons();
