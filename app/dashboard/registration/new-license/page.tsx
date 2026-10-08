import { Suspense } from "react";
import NewLicenseList from "@/app/components/Dashboard/Registration/NewLicenseList";

export default function Page() {
  return (
    <Suspense>
      <NewLicenseList />
    </Suspense>
  );
}
