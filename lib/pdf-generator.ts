import jsPDF from 'jspdf';
import { Character, getAbilityModifier, getProficiencyBonus, SKILLS, CLASSES } from './dnd-data';
import { getFeatById } from './feats-data';
import { getLanguageById } from './languages-data';

export async function generateCharacterPDF(character: Character): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // 使用内置字体支持中文
  pdf.setFont('helvetica');

  // ========== 第一页 ==========
  
  // 标题区域
  pdf.setFontSize(24);
  pdf.setTextColor(139, 28, 28);
  pdf.setFont('helvetica', 'bold');
  const title = character.name || '未命名角色';
  pdf.text(title, pageWidth / 2, margin + 8, { align: 'center' });
  
  // 分隔线
  pdf.setDrawColor(139, 28, 28);
  pdf.setLineWidth(0.5);
  pdf.line(margin, margin + 12, pageWidth - margin, margin + 12);
  
  let yPos = margin + 20;
  
  // 基本信息行
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  const basicInfo = [
    `职业: ${character.class}`,
    `等级: ${character.level}`,
    `物种: ${character.species}`,
    `背景: ${character.background}`,
    `阵营: ${character.alignment}`,
  ];
  
  const infoWidth = (pageWidth - 2 * margin) / 5;
  basicInfo.forEach((info, index) => {
    const xPos = margin + index * infoWidth;
    pdf.text(info, xPos, yPos);
  });
  
  yPos += 10;
  
  // 左栏：属性值 (30% 宽度)
  const leftWidth = (pageWidth - 2 * margin) * 0.3;
  const rightWidth = (pageWidth - 2 * margin) * 0.65;
  const gap = 10;
  
  // 属性值标题
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('属性值', margin, yPos);
  yPos += 6;
  
  // 绘制属性框
  const abilities = [
    { key: 'strength', name: '力量', abbr: 'STR' },
    { key: 'dexterity', name: '敏捷', abbr: 'DEX' },
    { key: 'constitution', name: '体质', abbr: 'CON' },
    { key: 'intelligence', name: '智力', abbr: 'INT' },
    { key: 'wisdom', name: '感知', abbr: 'WIS' },
    { key: 'charisma', name: '魅力', abbr: 'CHA' },
  ];
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  abilities.forEach((ability, index) => {
    const boxY = yPos + index * 12;
    const baseValue = character.abilities[ability.key as keyof typeof character.abilities];
    const bonus = character.backgroundAbilityBonuses?.[ability.name] || 0;
    const finalValue = baseValue + bonus;
    const modifier = getAbilityModifier(finalValue);
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    
    // 绘制边框
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, boxY - 3, leftWidth - 2, 10);
    
    // 属性名
    pdf.text(`${ability.name} (${ability.abbr})`, margin + 2, boxY + 2);
    
    // 属性值
    pdf.setFont('helvetica', 'bold');
    if (bonus > 0) {
      pdf.text(`${finalValue}`, margin + leftWidth - 24, boxY + 2);
      pdf.setFontSize(7);
      pdf.setTextColor(200, 100, 0);
      pdf.text(`(${baseValue}+${bonus})`, margin + leftWidth - 22, boxY + 6);
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
    } else {
      pdf.text(`${finalValue}`, margin + leftWidth - 20, boxY + 2);
    }
    
    // 调整值
    pdf.setTextColor(139, 28, 28);
    pdf.text(modifierStr, margin + leftWidth - 10, boxY + 2);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
  });
  
  // 熟练加值和其他战斗数据
  const profBonus = getProficiencyBonus(character.level);
  yPos += 75;
  
  pdf.setDrawColor(139, 28, 28);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, yPos, leftWidth - 2, 25);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('战斗数据', margin + 2, yPos + 5);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`熟练加值: +${profBonus}`, margin + 2, yPos + 11);
  pdf.text(`生命值: ${character.hitPoints}`, margin + 2, yPos + 17);
  pdf.text(`护甲等级: ${character.armorClass}`, margin + 2, yPos + 23);
  
  // 右栏：技能和特性
  let rightYPos = margin + 26;
  const rightX = margin + leftWidth + gap;
  
  // 技能熟练
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('技能熟练', rightX, rightYPos);
  rightYPos += 6;
  
  if (character.skills && character.skills.length > 0) {
    // 按属性分组显示技能
    const skillsByAbility = SKILLS.reduce((acc, skill) => {
      if (character.skills?.includes(skill.name)) {
        if (!acc[skill.ability]) {
          acc[skill.ability] = [];
        }
        acc[skill.ability].push(skill);
      }
      return acc;
    }, {} as Record<string, typeof SKILLS>);
    
    const abilityNames: Record<string, string> = {
      strength: '力量',
      dexterity: '敏捷',
      constitution: '体质',
      intelligence: '智力',
      wisdom: '感知',
      charisma: '魅力',
    };
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    Object.entries(skillsByAbility).forEach(([ability, skills]) => {
      if (rightYPos > pageHeight - 40) {
        pdf.addPage();
        rightYPos = margin;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${abilityNames[ability]}:`, rightX, rightYPos);
      pdf.setFont('helvetica', 'normal');
      
      const skillNames = skills.map(s => s.name).join('、');
      const lines = pdf.splitTextToSize(skillNames, rightWidth - 30);
      lines.forEach((line: string, index: number) => {
        pdf.text(line, rightX + 15, rightYPos + index * 4);
      });
      
      rightYPos += Math.max(4, lines.length * 4);
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('无', rightX, rightYPos);
  }
  
  rightYPos += 8;
  
  // 语言
  if (rightYPos > pageHeight - 40) {
    pdf.addPage();
    rightYPos = margin;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('语言', rightX, rightYPos);
  rightYPos += 6;
  
  if (character.languages && character.languages.length > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const languageNames = character.languages.map(langId => {
      const lang = getLanguageById(langId);
      return lang ? lang.name : langId;
    }).join('、');
    const langLines = pdf.splitTextToSize(languageNames, rightWidth);
    langLines.forEach((line: string) => {
      if (rightYPos > pageHeight - 20) {
        pdf.addPage();
        rightYPos = margin;
      }
      pdf.text(line, rightX, rightYPos);
      rightYPos += 4;
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('通用语', rightX, rightYPos);
    rightYPos += 4;
  }
  
  rightYPos += 6;
  
  // 专长
  if (rightYPos > pageHeight - 40) {
    pdf.addPage();
    rightYPos = margin;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('专长', rightX, rightYPos);
  rightYPos += 6;
  
  if (character.feats && character.feats.length > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    character.feats.forEach((featId) => {
      const feat = getFeatById(featId);
      if (feat && rightYPos < pageHeight - 20) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${feat.name}`, rightX, rightYPos);
        rightYPos += 4;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const descLines = pdf.splitTextToSize(feat.description, rightWidth - 5);
        descLines.forEach((line: string) => {
          if (rightYPos > pageHeight - 20) return;
          pdf.text(line, rightX + 3, rightYPos);
          rightYPos += 3.5;
        });
        
        pdf.setFontSize(9);
        rightYPos += 2;
      }
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('无', rightX, rightYPos);
    rightYPos += 4;
  }
  
  rightYPos += 6;
  
  // 熟练项
  if (rightYPos > pageHeight - 40) {
    pdf.addPage();
    rightYPos = margin;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('熟练项', rightX, rightYPos);
  rightYPos += 6;
  
  if (character.proficiencies && character.proficiencies.length > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const profText = character.proficiencies.join('、');
    const profLines = pdf.splitTextToSize(profText, rightWidth);
    profLines.forEach((line: string) => {
      if (rightYPos > pageHeight - 20) {
        pdf.addPage();
        rightYPos = margin;
      }
      pdf.text(line, rightX, rightYPos);
      rightYPos += 4;
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('无', rightX, rightYPos);
    rightYPos += 4;
  }
  
  rightYPos += 6;
  
  // 职业特性选择
  if (character.classFeatureChoices && Object.keys(character.classFeatureChoices).length > 0) {
    if (rightYPos > pageHeight - 40) {
      pdf.addPage();
      rightYPos = margin;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('职业特性', rightX, rightYPos);
    rightYPos += 6;
    
    const classData = CLASSES.find(c => c.name === character.class);
    const featureChoices = (classData as any)?.featureChoices || [];
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    Object.entries(character.classFeatureChoices).forEach(([featureId, selectedId]) => {
      const feature = featureChoices.find((f: any) => f.id === featureId);
      const option = feature?.options.find((o: any) => o.id === selectedId);
      
      if (feature && option) {
        if (rightYPos > pageHeight - 20) {
          pdf.addPage();
          rightYPos = margin;
        }
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${feature.name}:`, rightX, rightYPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(option.name, rightX + 35, rightYPos);
        rightYPos += 5;
      }
    });
    
    rightYPos += 3;
  }
  
  // 特性
  if (rightYPos > pageHeight - 40) {
    pdf.addPage();
    rightYPos = margin;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('特性和能力', rightX, rightYPos);
  rightYPos += 6;
  
  if (character.features && character.features.length > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    character.features.forEach((feature) => {
      if (rightYPos > pageHeight - 20) {
        pdf.addPage();
        rightYPos = margin;
      }
      pdf.text(`• ${feature}`, rightX, rightYPos);
      rightYPos += 5;
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('无', rightX, rightYPos);
    rightYPos += 4;
  }
  
  // ========== 第二页 ==========
  pdf.addPage();
  yPos = margin;
  
  // 页面标题
  pdf.setFontSize(18);
  pdf.setTextColor(139, 28, 28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${character.name} - 装备与背景`, pageWidth / 2, yPos, { align: 'center' });
  
  pdf.setDrawColor(139, 28, 28);
  pdf.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
  
  yPos += 15;
  
  // 装备
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('装备', margin, yPos);
  yPos += 6;
  
  if (character.equipment && character.equipment.length > 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    // 分栏显示装备
    const equipPerColumn = Math.ceil(character.equipment.length / 2);
    const colWidth = (pageWidth - 2 * margin - 10) / 2;
    
    character.equipment.forEach((item, index) => {
      const col = Math.floor(index / equipPerColumn);
      const row = index % equipPerColumn;
      const xPos = margin + col * (colWidth + 10);
      const itemYPos = yPos + row * 5;
      
      if (itemYPos > pageHeight - 40) return;
      
      pdf.text(`• ${item}`, xPos, itemYPos);
    });
    
    yPos += Math.min(equipPerColumn, 20) * 5 + 8;
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('无', margin, yPos);
    yPos += 10;
  }
  
  // 法术（如果有）
  if (character.spells && character.spells.length > 0) {
    if (yPos > pageHeight - 50) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('法术', margin, yPos);
    yPos += 6;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    character.spells.forEach((spell) => {
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(`• ${spell}`, margin, yPos);
      yPos += 5;
    });
    
    yPos += 8;
  }
  
  // 背景故事
  if (character.backstory) {
    if (yPos > pageHeight - 50) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('背景故事', margin, yPos);
    yPos += 6;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const backstoryLines = pdf.splitTextToSize(character.backstory, pageWidth - 2 * margin);
    backstoryLines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += 4;
    });
  }
  
  // 页脚
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont('helvetica', 'normal');
    
    const footerText = `第 ${i} 页 / 共 ${totalPages} 页  |  D&D 2024 角色卡  |  创建于: ${new Date(character.createdAt).toLocaleDateString('zh-CN')}`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }
  
  // 下载
  const fileName = `${character.name || '角色卡'}_Lv${character.level}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

// 从 HTML 元素生成 PDF（备用方法）
export async function generatePDFFromElement(element: HTMLElement, filename: string): Promise<void> {
  // 这个方法暂时保留，但主要使用上面的方法；可在此实现基于 html2canvas 的备用方案
}
