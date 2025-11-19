module.exports = {
  hooks: {
    "page": function (page) {
      const script = `
<script>
(function() {
  const root = window.parent || window;

  // 防止多次初始化
  if (root.__POPUP_PLUGIN_INITIALIZED__) return;
  root.__POPUP_PLUGIN_INITIALIZED__ = true;

  /*** 创建弹窗 modal ***/
  const modal = root.document.createElement("div");
  modal.style.cssText = \`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    overflow: hidden;
  \`;

  /*** 创建弹窗图片 ***/
  const img = root.document.createElement("img");
  img.style.cssText = \`
    max-width: 90%;
    max-height: 90%;
    cursor: grab;
    position: relative;
    user-select: none;
    transition: transform 0.1s ease-out;
    z-index: 1;
  \`;

  /*** 创建关闭按钮（固定在窗口右上角百分比位置） ***/
  const closeBtn = root.document.createElement("div");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = \`
    position: absolute;
    top: 10%;
    right: 20%;
    width: 36px;
    height: 36px;
    font-size: 22px;
    color: white;
    background: rgba(50,50,50,0.8);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    z-index: 100000;
  \`;
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(255,0,0,0.9)";
    closeBtn.style.transform = "scale(1.2)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "rgba(50,50,50,0.8)";
    closeBtn.style.transform = "scale(1)";
  });
  closeBtn.addEventListener("click", () => { modal.style.display = "none"; });

  modal.appendChild(img);
  modal.appendChild(closeBtn);
  root.document.body.appendChild(modal);

  /*** 创建提示信息（显示滚轮操作提示） ***/
  const tip = root.document.createElement("div");
  tip.innerText = "鼠标滚轮放大/缩小图片";
  tip.style.cssText = \`
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.5s;
    z-index: 100001;
    pointer-events: none;
  \`;
  root.document.body.appendChild(tip);

  function showTip() {
    tip.style.opacity = "1";
    setTimeout(() => { tip.style.opacity = "0"; }, 2500);
  }

  /*** 初始化状态变量 ***/
  let scale = 1;
  let imgX = 0, imgY = 0;

  /*** 点击页面图片，显示弹窗 ***/
  root.document.addEventListener("click", function(e) {
    if (e.target.tagName === "IMG" && e.target !== img) {
      img.src = e.target.src;
      scale = 1;
      imgX = 0;
      imgY = 0;
      img.style.transform = \`translate(\${imgX}px,\${imgY}px) scale(\${scale})\`;
      modal.style.display = "flex";
      showTip();
    }
  });

  /*** 点击遮罩关闭弹窗 ***/
  modal.addEventListener("click", function(e) {
    if (e.target === modal) modal.style.display = "none";
  });

  /*** 鼠标滚轮缩放图片 ***/
  modal.addEventListener("wheel", function(e) {
    e.preventDefault();
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(scale, 0.2), 5); // 限制缩放范围
    img.style.transform = \`translate(\${imgX}px,\${imgY}px) scale(\${scale})\`;
  });

  /*** ESC 键关闭弹窗 ***/
  root.document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") modal.style.display = "none";
  });

  /*** 拖拽图片 ***/
  img.addEventListener("pointerdown", function(e) {
    e.preventDefault();
    img.setPointerCapture(e.pointerId);
    const startX = e.clientX - imgX;
    const startY = e.clientY - imgY;
    img.style.cursor = "grabbing";
    img.style.transition = "none";

    function onPointerMove(ev) {
      imgX = ev.clientX - startX;
      imgY = ev.clientY - startY;
      img.style.transform = \`translate(\${imgX}px,\${imgY}px) scale(\${scale})\`;
    }

    function onPointerUp(ev) {
      img.releasePointerCapture(ev.pointerId);
      img.style.cursor = "grab";
      img.style.transition = "transform 0.1s ease-out";
      img.removeEventListener("pointermove", onPointerMove);
      img.removeEventListener("pointerup", onPointerUp);
    }

    img.addEventListener("pointermove", onPointerMove);
    img.addEventListener("pointerup", onPointerUp);
  });

})();
</script>

<style>
/* 鼠标悬停提示样式 */
img { cursor: zoom-in; user-select: none; }
</style>
`;
      page.content += script;
      return page;
    }
  }
};
