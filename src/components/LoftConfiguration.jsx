import { useState } from "react";
import useLofts from "../hooks/useLofts";
import loftStore from "../data/LoftStore";
import {
  updateLinkedLoft,
} from "../data/LoftLinkService";
import LoftConfigurationHeader from
  "./LoftConfiguration/LoftConfigurationHeader";
import LoftConfigurationList from
  "./LoftConfiguration/LoftConfigurationList";
import LoftForm from
  "./LoftConfiguration/LoftForm";
import HospitalConfigurationCard from "./LoftConfiguration/HospitalConfigurationCard";

export default function LoftConfiguration({ onOpenHealthcare }) {
  const lofts = useLofts();
  const [editingLoft, setEditingLoft] =
    useState(null);
  const [addingLoft, setAddingLoft] =
    useState(false);

  function saveLoft(loft) {
    if (editingLoft) {
      updateLinkedLoft(editingLoft.id, loft);
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

      <HospitalConfigurationCard onOpenHealthcare={onOpenHealthcare} />

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
