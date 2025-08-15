import QRCode from "react-qr-code";

interface Props {
  id: string;
}

export default function QRCodeDisplay({ id }: Props) {
  return (
    <div className="p-4 bg-white">
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={id}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
}
