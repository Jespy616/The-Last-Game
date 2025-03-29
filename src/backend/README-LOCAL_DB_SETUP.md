# 🚀 Setting Up the Project with PostgreSQL and `.env-personal` Configuration

This guide walks you through setting up PostgreSQL, configuring a `.env-personal` file, and connecting your Go backend to the database.

---

## 📌 Step 1: Creating a `.env-personal` File

The **`.env-personal`** file is used to store database credentials and must be placed in the **same directory as `main.go`**.

### 1️⃣ Create a `.env-personal` file  
In your project directory, **next to `main.go`**, create a file named `.env-personal`:

### 2️⃣ Add the following contents to `.env-personal`
#### Make the values whatever you want
```env
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=mydatabase
DB_PORT=5432
DB_SSLMODE=disable
DB_TIMEZONE=UTC
```

💡 **Make sure there are no spaces around the `=` signs**.

---

## 📌 Step 2: Installing PostgreSQL

### 1️⃣ Install the PostgreSQL App (Mac & Windows)
- **Mac**: Download and install from [PostgresApp](https://postgresapp.com/)
- **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/)

---

## 📌 Step 3: Connecting to PostgreSQL from the Command Line

### 1️⃣ Open PostgreSQL CLI
To enter the PostgreSQL interactive terminal (psql), run:

```sh
psql postgres
```

---

## 📌 Step 4: Creating a User & Database

### 1️⃣ Create a New PostgreSQL User
#### Replace the values with your .env-personal values
Inside the `psql` prompt, run:

```sql
CREATE USER myuser WITH PASSWORD 'mypassword';
```

### 2️⃣ Create a New Database
```sql
CREATE DATABASE mydatabase;
```

### 3️⃣ Grant the User Full Permissions
```sql
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
```

### 4️⃣ Verify User & Database
To check users:
```sql
\du
```

To list databases:
```sql
\l
```

Exit `psql` by typing:
```sh
\q
```

---

``

### ️Run the Go App
Now that the database is set up, you can run your Go backend:

```sh
go run main.go
```

### Expected Output
If everything is working, you should see:

```sh
Database connected successfully
```

If there’s an error, double-check your **`.env-personal`** file and PostgreSQL user settings.

---

## 📌 Step 6: Common Troubleshooting

### Manually Connect to PostgreSQL
```sh
psql -U myuser -d mydatabase
```

### Check `.env-personal` Variables

Ensure it contains **valid credentials**.

---

## 🎉 Congratulations!

Your Go backend is now set up to connect to PostgreSQL using the `.env-personal` file. 🚀 If you have any issues, double-check your **PostgreSQL setup, `.env-personal` file, and database user permissions**.

Happy coding! 🎨💻

