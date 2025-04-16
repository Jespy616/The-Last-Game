# **Docker Setup and Usage Guide**

## **Introduction**
This guide provides step-by-step instructions for installing, configuring, and running Docker for our project. It includes details on using Docker via command line, Docker Desktop, and VS Code.

---

## **1. Installing Docker**
### **Windows & macOS**
1. Download and install **Docker Desktop** from [Docker's official site](https://www.docker.com/products/docker-desktop/).
2. Ensure that **WSL 2** is installed (Windows users will be prompted to install it).
3. Restart your computer after installation.
4. Open a terminal or command prompt and verify installation:
   ```sh
   docker --version
   ```
   Expected output (version may vary):
   ```sh
   Docker version 24.0.2, build cb74dfc
   ```

### **Linux** (Chat made ths part, needs Verification)
1. Install Docker:
   ```sh
   sudo apt update
   sudo apt install docker.io -y
   ```
2. Start Docker and enable it on boot:
   ```sh
   sudo systemctl start docker
   sudo systemctl enable docker
   ```
3. Verify installation:
   ```sh
   docker --version
   ```

4. **(Optional)** Add your user to the `docker` group to avoid using `sudo`:
   ```sh
   sudo usermod -aG docker $USER
   ```
   Restart your terminal for changes to take effect.

---

## **2. Running and Managing Containers via Command Line**
1. Create or ensure you have a **`.env` file** in the project root (in the same folder as the docker-compose.yml file) with necessary environment variables. The way I currently have it, docker uses one central `.env` file for secret keys and passwords. This file will not be added in the image or on git, so you will need to make and keep your own on your machine. Text Ethan for what needs to go into the file. 
3. Build and start Docker services:
   ```sh
   docker-compose up --build -d
   ```
   - `--build`: Rebuilds the images if changes were made.
   - `-d`: Runs in detached mode (in the background).
   
    This will start the three containers in this Docker project, namely backend, frontend, and game_db (database). **You do not need to install anything like Go, Postgres, Svelte, or any other software to run your code** with the other portions written by the rest of us. Docker will do all that for you. 
4. Check running containers:
   ```sh
   docker ps
   ```


4. Stops and removes all running containers. Do this after you finish your coding sessions.
    ```sh
    docker-compose down
    ```


### **Restarting Containers**
```sh
docker-compose restart
```
Restarts all containers.

### **Viewing Container Logs**
```sh
docker-compose logs -f backend
```
Shows real-time logs for a specific container (e.g., `backend`).

### **Accessing a Running Container’s Shell**
```sh
docker exec -it backend sh
```
Opens a shell session inside the `backend` container.

---

## **4. Using Docker Desktop**
### **Starting & Stopping Services**
1. Open **Docker Desktop**.
2. Navigate to the **Containers** tab.
3. Start or stop services by clicking the play/stop buttons.

### **Checking Logs**
1. Click on a running container.
2. Navigate to the **Logs** tab.

### **Accessing a Running Container’s Shell**
1. Click on a running container
2. Navigate to the **Exec** tab to access a shell inside that container. This allows for better testing of that particular shell. For example, you could run the command to display environment variables to see if they transfered through from your .env file.

---


## **6. Cleaning Up Docker**
### **Remove Unused Containers & Images**
```sh
docker system prune -a
```
This removes all unused containers, images, and networks to free up space.



## **Conclusion**
Following these steps will ensure a smooth Docker setup for our project. If you run into any issues, feel free to ask for help in the team chat. 🚀

