// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// })

import fs from "fs";
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "lectures.learn.pk",
    port: 5173,
    https: {
      key: fs.readFileSync("/home/mark/.vite-ssl/localhost-key.pem"),
      cert: fs.readFileSync("/home/mark/.vite-ssl/localhost-cert.pem")
    }
  }
});