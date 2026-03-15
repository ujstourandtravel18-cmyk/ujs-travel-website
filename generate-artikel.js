#!/usr/bin/env node
// generate-artikel.js
// Jalankan: node generate-artikel.js
// Script ini membaca semua file di _artikel/*.md dan generate _artikel/index.json

const fs = require('fs');
const path = require('path');

const artikelDir = path.join(__dirname, '_artikel');
const outputFile = path.join(artikelDir, 'index.json');

// Buat folder kalau belum ada
if (!fs.existsSync(artikelDir)) {
    fs.mkdirSync(artikelDir, { recursive: true });
}

// Baca semua file .md
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith('.md'));

const artikelList = [];

files.forEach(file => {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(artikelDir, file), 'utf8');

    // Parse frontmatter (--- ... ---)
    const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
    if (!fmMatch) return;

    const fm = {};
    fmMatch[1].split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) return;
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        // Remove quotes
        if ((val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        fm[key] = val;
    });

    // Body = setelah frontmatter
    const body = content.replace(/^---\n[\s\S]+?\n---\n/, '').trim();

    // Buat JSON per artikel
    const artikelData = {
        slug,
        title: fm.title || '',
        date: fm.date || '',
        category: fm.category || '',
        readTime: fm.readTime || '5 menit baca',
        thumbnail: fm.thumbnail || '',
        description: fm.description || '',
        highlights: [],
        tags: fm.tags || '',
        featured: fm.featured === 'true',
        body
    };

    // Simpan JSON per artikel
    fs.writeFileSync(
        path.join(artikelDir, `${slug}.json`),
        JSON.stringify(artikelData, null, 2)
    );

    // Tambah ke list (tanpa body untuk performa)
    artikelList.push({
        slug,
        title: artikelData.title,
        date: artikelData.date,
        category: artikelData.category,
        readTime: artikelData.readTime,
        thumbnail: artikelData.thumbnail,
        description: artikelData.description,
        featured: artikelData.featured
    });

    console.log(`✅ Generated: ${slug}.json`);
});

// Sort by date terbaru
artikelList.sort((a, b) => new Date(b.date) - new Date(a.date));

// Simpan index
fs.writeFileSync(outputFile, JSON.stringify(artikelList, null, 2));
console.log(`\n📋 index.json updated — ${artikelList.length} artikel`);