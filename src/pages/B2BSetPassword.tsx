import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const B2BSetPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/b2b-login", { replace: true });
  }, [navigate]);

  return null;
};

export default B2BSetPassword;
