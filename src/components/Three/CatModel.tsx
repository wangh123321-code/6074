import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useAnatomyStore } from '../../store/useAnatomyStore';
import { OrganMesh } from './OrganMesh';
import organsData from '../../data/organs.json';
import { Organ } from '../../types/anatomy';

export const CatModel = () => {
  const organs = useMemo(() => organsData as Organ[], []);
  const layers = useAnatomyStore((state) => state.layers);
  const setLoading = useAnatomyStore((state) => state.setLoading);
  const setLoadingProgress = useAnatomyStore((state) => state.setLoadingProgress);

  useEffect(() => {
    let progress = 0;
    const total = organs.length;
    const interval = setInterval(() => {
      progress += 1;
      setLoadingProgress((progress / total) * 100);
      if (progress >= total) {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [organs.length, setLoading, setLoadingProgress]);

  const skinOrgans = organs.filter((o) => o.layer === 'skin');
  const muscleOrgans = organs.filter((o) => o.layer === 'muscle');
  const boneOrgans = organs.filter((o) => o.layer === 'bone');
  const organOrgans = organs.filter((o) => o.layer === 'organ');
  const vesselOrgans = organs.filter((o) => o.layer === 'vessel');

  return (
    <group name="catModel">
      <group name="skinLayer">
        {skinOrgans.map((organ) => (
          <OrganMesh key={organ.id} organ={organ} />
        ))}
      </group>

      <group name="muscleLayer">
        {muscleOrgans.map((organ) => (
          <OrganMesh
            key={organ.id}
            organ={organ}
            muscleLevel={layers.muscle.level}
          />
        ))}
      </group>

      <group name="boneLayer">
        {boneOrgans.map((organ) => (
          <OrganMesh key={organ.id} organ={organ} />
        ))}
      </group>

      <group name="organLayer">
        {organOrgans.map((organ) => (
          <OrganMesh key={organ.id} organ={organ} />
        ))}
      </group>

      <group name="vesselLayer">
        {vesselOrgans.map((organ) => (
          <OrganMesh key={organ.id} organ={organ} />
        ))}
      </group>
    </group>
  );
};
