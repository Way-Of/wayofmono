// .gemini/skills/wow-skill-creator/assets/ui-templates/example-component.tsx
import React from 'react';

interface ExampleComponentProps {
  data: string;
  tenantId: string; // Adhering to multi-tenancy mandate
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ data, tenantId }) => {
  // Example of conditional rendering based on a fictional 'isAdmin' check
  const isAdmin = true; // In a real component, this would come from a context or auth hook

  return (
    <div className="bg-[#252526] p-4 rounded border border-[#3c3c3c] text-white">
      <h3 className="text-lg font-semibold mb-2">WoW Example Component</h3>
      <p>Data: {data}</p>
      <p>Tenant ID: {tenantId}</p>
      {isAdmin && (
        <button className="mt-4 px-4 py-2 bg-[#ea580c] hover:bg-[#d45309] rounded text-white text-sm">
          Admin Action
        </button>
      )}
    </div>
  );
};
