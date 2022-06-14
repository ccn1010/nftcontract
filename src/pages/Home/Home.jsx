import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Home() {

  return (
    <div>
        <Link to="/sniff">SNIFF</Link>
        <Link to="/collections">MINT</Link>
        <Link to="/free">FREE MINT</Link>
    </div>
  );
}

export default Home;
