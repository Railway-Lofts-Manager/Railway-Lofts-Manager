import { useState } from "react";
import useLofts from "../hooks/useLofts";
import loftStore from "../data/LoftStore";
import LoftConfigurationHeader from
  "./LoftConfiguration/LoftConfigurationHeader";
import LoftConfigurationList from
  "./LoftConfiguration/LoftConfigurationList";
import LoftForm from
  "./LoftConfiguration/LoftForm";

export default function LoftConfiguration() {
  const lofts = useLofts();
  const [editingLoft, setEditingLoft] =
    useState(null);
  const [addingLoft, setAddingLoft] =
    useState(false);

  function saveLoft(loft) {
    if (editingLoft) {
      loftStore.updateLoft(editingLoft.id, loft);
    } else {
      loftStore.addLoft({
        ...loft,
        id: `loft-${Date.now()}`,
      });
    }

    setEditingLoft(null);
    setAddingLoft(false);
  }

  const formOpen = addingLoft || editingLoft;

  return (
    <>
      <LoftConfigurationHeader />

      {formOpen && (
        <LoftForm
          loft={editingLoft}
          onSave={saveLoft}
          onCancel={() => {
            setEditingLoft(null);
            setAddingLoft(false);
          }}
        />
      )}

      <LoftConfigurationList
        lofts={lofts}
        onEditLoft={setEditingLoft}
        onAddLoft={() => setAddingLoft(true)}
      />
    </>
  );
}