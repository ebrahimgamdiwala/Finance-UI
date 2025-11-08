"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RoleSelectionModal from "@/components/RoleSelectionModal";

export default function RoleSetupPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  // Determine initial modal state based on session
  const shouldShowModal = status === "authenticated" && !session?.user?.role;
  const [showModal, setShowModal] = useState(shouldShowModal);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role) {
      // User already has a role (including TEAM_MEMBER), redirect to dashboard
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleClose = async () => {
    setShowModal(false);
    // Update the session
    await update();
    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <RoleSelectionModal
        isOpen={showModal}
        onClose={handleClose}
        userEmail={session?.user?.email}
        userName={session?.user?.name}
      />
    </div>
  );
}
