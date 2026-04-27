const generateCertificate = ({ userName, projectName, projectDate }) => {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 620;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 900, 620);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 900, 620);

  // Gold border
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 860, 580);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 836, 556);

  // Corner decorations
  const corners = [[40, 40], [860, 40], [40, 580], [860, 580]];
  corners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  });

  // Header
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🌍 BRIDGEUP — SDG 17 PARTNERSHIPS FOR THE GOALS', 450, 80);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(80, 100);
  ctx.lineTo(820, 100);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Certificate of title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 48px Georgia';
  ctx.fillText('Certificate of Participation', 450, 175);

  // "This certifies that"
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px Arial';
  ctx.fillText('This certificate is proudly presented to', 450, 235);

  // User name
  const nameGrad = ctx.createLinearGradient(200, 0, 700, 0);
  nameGrad.addColorStop(0, '#10b981');
  nameGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = nameGrad;
  ctx.font = 'bold 54px Georgia';
  ctx.fillText(userName, 450, 310);

  // Underline name
  ctx.beginPath();
  const nameWidth = ctx.measureText(userName).width;
  ctx.moveTo(450 - nameWidth / 2, 320);
  ctx.lineTo(450 + nameWidth / 2, 320);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();

  // For participation in
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px Arial';
  ctx.fillText('for their valuable contribution and participation in', 450, 370);

  // Project name
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 32px Georgia';
  ctx.fillText(`"${projectName}"`, 450, 420);

  // Date
  ctx.fillStyle = '#64748b';
  ctx.font = '18px Arial';
  const formattedDate = new Date(projectDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillText(`Date: ${formattedDate}`, 450, 470);

  // Bottom divider
  ctx.beginPath();
  ctx.moveTo(80, 510);
  ctx.lineTo(820, 510);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Footer
  ctx.fillStyle = '#475569';
  ctx.font = '14px Arial';
  ctx.fillText('BridgeUp Platform  •  Empowering communities through partnerships  •  SDG 17', 450, 545);

  // Download
  const link = document.createElement('a');
  link.download = `BridgeUp_Certificate_${userName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export default generateCertificate;
