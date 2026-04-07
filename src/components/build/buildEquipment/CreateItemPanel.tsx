import React, { useMemo, useState } from "react";
import CreateItemActionBar from "./createItem/CreateItemActionBar";
import CreateEquipmentForm from "./createItem/CreateEquipmentForm";
import CreateItemPlaceholder from "./createItem/CreateItemPlaceholder";
import CreateItemTabBar, {
  type CreateItemTabItem,
} from "./createItem/CreateItemTabBar";
import CreatePlateForm from "./createItem/CreatePlateForm";
import type {
  CreateItemMode,
  CreateItemTabKey,
} from "./createItem/createItemTypes";

export interface CreateItemPanelProps {
  width?: string;
  title?: string;
  mode?: CreateItemMode;
  editingSlotIndex?: number | null;
  onFinishEdit?: () => void;
}

const CreateItemPanel: React.FC<CreateItemPanelProps> = ({
  width = "60%",
  title = "Create Item",
  mode = "new",
  editingSlotIndex = null,
  onFinishEdit,
}) => {
  const tabs = useMemo<CreateItemTabItem[]>(() => {
    return [
      { key: "plate", label: "Create Plate" },
      { key: "rune", label: "Create Rune" },
      { key: "card", label: "Create Card" },
      { key: "equipment", label: "Create Equipment" },
    ];
  }, []);

  const [manualActiveTab, setManualActiveTab] = useState<CreateItemTabKey | null>(null);
  const [manualIsCreating, setManualIsCreating] = useState<boolean>(false);
  const [formInstanceKey, setFormInstanceKey] = useState<number>(0);
  const [plateSubmitHandler, setPlateSubmitHandler] = useState<(() => boolean) | null>(null);
  const [equipmentSubmitHandler, setEquipmentSubmitHandler] = useState<(() => boolean) | null>(null);
  const [canCreatePlate, setCanCreatePlate] = useState<boolean>(false);
  const [canCreateEquipment, setCanCreateEquipment] = useState<boolean>(false);

  const isEditModeActive = mode === "edit" && editingSlotIndex !== null;

  const activeTab = useMemo<CreateItemTabKey | null>(() => {
    if (isEditModeActive) {
      return "plate";
    }

    return manualActiveTab;
  }, [isEditModeActive, manualActiveTab]);

  const isCreating = useMemo<boolean>(() => {
    if (isEditModeActive) {
      return true;
    }

    return manualIsCreating;
  }, [isEditModeActive, manualIsCreating]);

  const effectiveFormKey = useMemo<number>(() => {
    if (isEditModeActive) {
      return editingSlotIndex ?? 0;
    }

    return formInstanceKey;
  }, [editingSlotIndex, formInstanceKey, isEditModeActive]);

  const handleTabChange = (tabKey: CreateItemTabKey): void => {
    setManualActiveTab(tabKey);
    setManualIsCreating(true);
    setFormInstanceKey((previous) => previous + 1);
    setPlateSubmitHandler(null);
    setEquipmentSubmitHandler(null);
    setCanCreatePlate(false);
    setCanCreateEquipment(false);
  };

  const handleCancel = (): void => {
    if (isEditModeActive) {
      setPlateSubmitHandler(null);
      setEquipmentSubmitHandler(null);
      setCanCreatePlate(false);
      setCanCreateEquipment(false);

      if (onFinishEdit) {
        onFinishEdit();
      }

      return;
    }

    setManualIsCreating(false);
    setManualActiveTab(null);
    setPlateSubmitHandler(null);
    setEquipmentSubmitHandler(null);
    setCanCreatePlate(false);
    setCanCreateEquipment(false);
  };

  const handlePrimaryAction = (): void => {
    if (!activeTab) {
      return;
    }

    if (activeTab === "plate") {
      if (!plateSubmitHandler) {
        return;
      }

      plateSubmitHandler();
      return;
    }

    if (activeTab === "equipment") {
      if (!equipmentSubmitHandler) {
        return;
      }

      equipmentSubmitHandler();
      return;
    }

    console.log(mode === "edit" ? "save item" : "create item", activeTab);
  };

  const content = useMemo<React.ReactNode>(() => {
    if (!isCreating || !activeTab) {
      return null;
    }

    if (activeTab === "plate") {
      return (
        <CreatePlateForm
          key={`plate-${effectiveFormKey}-${mode}-${editingSlotIndex ?? 0}`}
          mode={mode}
          editingSlotIndex={editingSlotIndex}
          onRegisterSubmit={(submitHandler) => {
            setPlateSubmitHandler(() => submitHandler);
          }}
          onCanSubmitChange={setCanCreatePlate}
          onFinishEdit={onFinishEdit}
        />
      );
    }

    if (activeTab === "rune") {
      return (
        <CreateItemPlaceholder
          key={`rune-${effectiveFormKey}`}
          title="Create Rune"
        />
      );
    }

    if (activeTab === "card") {
      return (
        <CreateItemPlaceholder
          key={`card-${effectiveFormKey}`}
          title="Create Card"
        />
      );
    }

    if (activeTab === "equipment") {
      return (
        <CreateEquipmentForm
          key={`equipment-${effectiveFormKey}`}
          onRegisterSubmit={(submitHandler) => {
            setEquipmentSubmitHandler(() => submitHandler);
          }}
          onCanSubmitChange={setCanCreateEquipment}
        />
      );
    }

    return null;
  }, [
    activeTab,
    editingSlotIndex,
    effectiveFormKey,
    isCreating,
    mode,
    onFinishEdit,
  ]);

  const isPrimaryDisabled = useMemo<boolean>(() => {
    if (!activeTab) {
      return true;
    }

    if (activeTab === "plate") {
      return !canCreatePlate;
    }

    if (activeTab === "equipment") {
      return !canCreateEquipment;
    }

    return false;
  }, [activeTab, canCreateEquipment, canCreatePlate]);

  const displayTitle = useMemo<string>(() => {
    if (mode === "edit") {
      return "Edit Item";
    }

    return title;
  }, [mode, title]);

  return (
    <div
      style={{
        width,
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#f3f4f6",
          marginBottom: "12px",
        }}
      >
        {displayTitle}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #374151",
          borderRadius: "10px",
          backgroundColor: "#111827",
          padding: "16px",
          color: "#cbd5e1",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <CreateItemTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {isCreating ? (
          <>
            <CreateItemActionBar
              mode={mode}
              onPrimaryClick={handlePrimaryAction}
              onCancelClick={handleCancel}
              isPrimaryDisabled={isPrimaryDisabled}
            />

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {content}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CreateItemPanel;