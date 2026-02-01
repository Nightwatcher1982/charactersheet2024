'use client';

import UnifiedSelector, { SelectorItem } from './UnifiedSelector';
import { SKILLS } from '@/lib/dnd-data';

interface SkillItem extends SelectorItem {
  ability: string;
}

interface UnifiedSkillSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  availableSkills: string[];
  requiredCount: number;
  onComplete: (skills: string[]) => void;
  initialSkills?: string[];
}

export default function UnifiedSkillSelector({
  isOpen,
  onClose,
  title,
  description,
  availableSkills,
  requiredCount,
  onComplete,
  initialSkills = []
}: UnifiedSkillSelectorProps) {
  // 转换为SelectorItem格式
  const items: SkillItem[] = availableSkills.map(skillName => {
    const skillData = SKILLS.find(s => s.name === skillName);
    return {
      id: skillName,
      name: skillName,
      description: skillData ? `基于${skillData.ability}` : undefined,
      ability: skillData?.ability || '未知',
      category: skillData?.ability,
    };
  });

  return (
    <UnifiedSelector
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      items={items}
      selectedItems={initialSkills}
      onConfirm={onComplete}
      minSelect={requiredCount}
      maxSelect={requiredCount}
      searchable={true}
      categorizable={true}
      multiSelect={true}
      showDescription={true}
    />
  );
}
