import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { setBreadCrumbs } from "@/store/slices/appSlice";
import { Link } from "react-router-dom";

export default function Home() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    document.title = "DrawLog - Think, Plan and Draw All in one place";
    dispatch(setBreadCrumbs([]));
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 bg-dotted">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-6xl"> Think, Plan and Draw </p>
        <p className="text-6xl text-gray-600">All in one place</p>
      </div>
      <Button
        variant="default"
        size="lg"
        className="rounded-sm px-10 py-6 cursor-pointer"
        asChild
      >
        <Link to="/whiteboard">Get Started</Link>
      </Button>
    </div>
  );
}
