import { Title } from "@mantine/core";
import Image from "next/image";
import logo from "../../../public/logo.webp";

const Header = () => {
  return (
    <header className="shadow-sm shadow-gray-500 justify-start px-6 py-4 flex gap-2">
      <Title ff="Helvetica">HeadWind</Title>
      <Image alt="Logo preview" src={logo.src} width={45} height={45} />
    </header>
  );
};
export default Header;
