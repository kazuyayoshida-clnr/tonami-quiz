import { Suspense } from "react";
import CertificateContent from "./CertificateContent";

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100dvh", background:"#1A0E05", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ color:"#C8A96E", fontFamily:"'Noto Sans JP', sans-serif" }}>よみこみちゅう…</p>
      </div>
    }>
      <CertificateContent />
    </Suspense>
  );
}
