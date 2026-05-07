# Katki Rehberi

Invitra'ya katki sagladiginiz icin tesekkur ederiz! Bu rehber, projeye nasil katki saglayabileceginizi aciklar.

## Davranis Kurallari

Bu projeye katilarak [Davranis Kurallarimizi](./CODE_OF_CONDUCT.md) kabul etmis olursunuz.

## Nasil Katki Saglayabilirim?

### Hata Bildirme

Bir hata bulduysaniz:

1. Oncelikle mevcut issue'lari kontrol edin
2. Hata daha once bildirilmemisse yeni bir issue acin
3. Issue basligina `[Bug]` ekleyin
4. Asagidaki bilgileri ekleyin:
   - Hatayi yeniden olusturma adimlari
   - Beklenen davranis
   - Gerceklesen davranis
   - Ortam bilgileri (OS, Node versiyonu, tarayici)
   - Hata mesaji / stack trace (tam metin)

### Ozellik Onermek

1. Mevcut issue'lari kontrol edin
2. Yeni bir issue acin, basliga `[Feature]` ekleyin
3. Onerinizi aciklayip neden gerekli oldugunu belirtin

### Kod Katki

1. Repo'yu fork edin
2. Feature branch olusturun: `git checkout -b feat/ozellik-adi`
3. Degisikliklerinizi yapip commit edin
4. Pull request acin

## Gelistirme Ortami

### Gereksinimler

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose
- Git

### Kurulum

```bash
# Fork'u klonla
git clone https://github.com/KULLANICI_ADINIZ/invitra.git
cd invitra

# Bagimliliklari yukle
npm install

# Ortam degiskenlerini ayarla
cp .env.example .env
# .env dosyasini duzenle (DATABASE_URL, ADMIN_PASSWORD_HASH)

# Veritabanini baslat
docker compose up -d postgres

# Migration calistir
npx prisma migrate dev

# Gelistirme modunu baslat
npm run dev
```

### Veritabani Semalari

```bash
# Schema degistirdikten sonra migration olustur
npx prisma migrate dev --name aciklama

# Prisma Client'i yenile
npx prisma generate
```

## Kod Standartlari

### TypeScript

- `any` type kullanma
- `@ts-ignore` / `@ts-nocheck` kullanma
- API input'larini validate et

### Commit Mesaji Formati

[Conventional Commits](https://www.conventionalcommits.org/) standardini kullanin:

```
<tip>(<kapsam>): <aciklama>
```

| Tip | Aciklama |
|-----|----------|
| `feat` | Yeni ozellik |
| `fix` | Hata duzeltme |
| `docs` | Sadece dokumantasyon |
| `style` | Format degisikligi (islev degisikliginde degil) |
| `refactor` | Yeniden yapilandirma |
| `chore` | Build, tooling, bagimlilik guncelleme |
| `perf` | Performans iyilestirme |

**Ornekler:**

```
feat(guests): add transportation type filter
fix(settings): sync form inputs after async settings load
docs(readme): update local setup instructions
chore(deps): upgrade next to 15.3
```

### Kapsam Ornekleri

`guests`, `settings`, `dashboard`, `auth`, `invite`, `groups`, `organizers`, `pwa`, `ui`

## Pull Request Sureci

1. PR basliginda Conventional Commits formatini kullan
2. PR aciklamasinda yapilan degisiklikleri ve test adimlari yaz
3. Ilgili issue'lara baglantin ekle (`Closes #123`)

## Guvenlik Aciklari

Guvenlik acigi bulduysan lutfen public issue acma. Dogrudan proje sahibiyle iletisime gec.
