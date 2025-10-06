import { Button } from "@/components/ui/button";
import { SettingTable } from "./SettingTable";
import { SettingModal } from "./SettingModal";
import { useSettingStore } from "../lib/setting.store";
import { SETTING } from "../lib/setting.interface";

const { MODEL } = SETTING;

const SettingPage = () => {
  const { setSettingModal } = useSettingStore();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{MODEL.plural}</h1>
        <Button onClick={() => setSettingModal(true)}>
          Crear {MODEL.name}
        </Button>
      </div>
      <SettingTable />
      <SettingModal />
    </div>
  );
};

export default SettingPage;
