/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFアップロード用にbody sizeを増やす（最大50MB）
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

module.exports = nextConfig;
