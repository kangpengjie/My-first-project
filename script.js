// 移动端退次卡页面交互脚本

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 初始化项目卡片交互
    initProjectCards();
    
    // 初始化按钮事件
    initButtonEvents();
    
    // 初始化表单验证
    initFormValidation();
}

// 初始化项目卡片交互
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        const checkbox = card.querySelector('.project-checkbox');
        const inputs = card.querySelectorAll('.refund-inputs input');
        
        // 复选框变化事件
        checkbox.addEventListener('change', function() {
            toggleProjectCard(card, this.checked);
        });
        
        // 输入框事件
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateInput(this, card);
            });
            
            input.addEventListener('focus', function() {
                this.select();
            });
        });
        
        // 初始状态设置
        toggleProjectCard(card, checkbox.checked);
    });
}

// 切换项目卡片状态
function toggleProjectCard(card, isEnabled) {
    const inputs = card.querySelectorAll('.refund-inputs input');
    
    if (isEnabled) {
        card.classList.remove('disabled');
        inputs.forEach(input => {
            input.disabled = false;
        });
    } else {
        card.classList.add('disabled');
        inputs.forEach(input => {
            input.disabled = true;
            input.value = '';
        });
    }
    
    updateSubmitButton();
}

// 验证输入
function validateInput(input, card) {
    const max = parseInt(input.getAttribute('max'));
    const value = parseInt(input.value);
    
    if (value > max) {
        input.value = max;
        showToast(`最大值为 ${max}`);
    }
    
    if (value < 0) {
        input.value = 0;
    }
    
    // 同步次数和金额（简单示例）
    const inputs = card.querySelectorAll('.refund-inputs input');
    const countInput = inputs[0];
    const amountInput = inputs[1];
    
    if (input === countInput && input.value) {
        // 根据次数计算金额（示例计算）
        const projectName = card.querySelector('.project-name').textContent;
        const unitPrice = projectName.includes('舞蹈') ? 225.6 : 223.6; // 1128/5 or 1118/5
        const calculatedAmount = Math.round(parseInt(input.value) * unitPrice);
        if (!amountInput.value) {
            amountInput.value = calculatedAmount;
        }
    }
    
    updateSubmitButton();
}

// 初始化按钮事件
function initButtonEvents() {
    // 返回按钮
    const backBtn = document.querySelector('.back-btn');
    backBtn.addEventListener('click', function() {
        if (confirm('确定要返回吗？未保存的数据将丢失。')) {
            window.history.back();
        }
    });
    
    // 关闭按钮
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        if (confirm('确定要关闭吗？未保存的数据将丢失。')) {
            window.close();
        }
    });
    
    // 取消按钮
    const cancelBtn = document.querySelector('.btn-secondary');
    cancelBtn.addEventListener('click', function() {
        if (confirm('确定要取消吗？未保存的数据将丢失。')) {
            resetForm();
        }
    });
    
    // 下一步按钮
    const nextBtn = document.querySelector('.btn-primary');
    nextBtn.addEventListener('click', function() {
        handleSubmit();
    });
}

// 初始化表单验证
function initFormValidation() {
    const remarksTextarea = document.querySelector('#remarks');
    
    remarksTextarea.addEventListener('input', function() {
        updateSubmitButton();
    });
}

// 更新提交按钮状态
function updateSubmitButton() {
    const nextBtn = document.querySelector('.btn-primary');
    const hasSelectedProject = document.querySelector('.project-checkbox:checked');
    const hasRefundData = hasValidRefundData();
    
    if (hasSelectedProject && hasRefundData) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.6';
    }
}

// 检查是否有有效的退款数据
function hasValidRefundData() {
    const checkedCards = document.querySelectorAll('.project-card:not(.disabled)');
    
    for (let card of checkedCards) {
        const inputs = card.querySelectorAll('.refund-inputs input');
        const countValue = parseInt(inputs[0].value) || 0;
        const amountValue = parseInt(inputs[1].value) || 0;
        
        if (countValue > 0 || amountValue > 0) {
            return true;
        }
    }
    
    return false;
}

// 处理提交
function handleSubmit() {
    const formData = collectFormData();
    
    if (validateFormData(formData)) {
        showLoading();
        
        // 模拟提交过程
        setTimeout(() => {
            hideLoading();
            showToast('提交成功！正在跳转到下一步...', 'success');
            
            // 3秒后跳转
            setTimeout(() => {
                console.log('跳转到下一步页面', formData);
                // window.location.href = '/next-step';
            }, 3000);
        }, 2000);
    }
}

// 收集表单数据
function collectFormData() {
    const formData = {
        cardName: document.querySelector('#cardName').value,
        cardNumber: document.querySelector('#cardNumber').value,
        applyDate: document.querySelector('#applyDate').value,
        remarks: document.querySelector('#remarks').value,
        projects: []
    };
    
    const checkedCards = document.querySelectorAll('.project-card:not(.disabled)');
    checkedCards.forEach(card => {
        const projectName = card.querySelector('.project-name').textContent;
        const inputs = card.querySelectorAll('.refund-inputs input');
        const refundCount = parseInt(inputs[0].value) || 0;
        const refundAmount = parseInt(inputs[1].value) || 0;
        
        if (refundCount > 0 || refundAmount > 0) {
            formData.projects.push({
                name: projectName,
                refundCount: refundCount,
                refundAmount: refundAmount
            });
        }
    });
    
    return formData;
}

// 验证表单数据
function validateFormData(formData) {
    if (formData.projects.length === 0) {
        showToast('请选择要退款的项目', 'error');
        return false;
    }
    
    for (let project of formData.projects) {
        if (project.refundCount <= 0 && project.refundAmount <= 0) {
            showToast('请输入有效的退款次数或金额', 'error');
            return false;
        }
    }
    
    return true;
}

// 重置表单
function resetForm() {
    document.querySelector('#remarks').value = '';
    
    const checkboxes = document.querySelectorAll('.project-checkbox');
    const inputs = document.querySelectorAll('.refund-inputs input');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    inputs.forEach(input => {
        input.value = '';
        input.disabled = true;
    });
    
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.add('disabled');
    });
    
    // 默认选中第一个项目
    const firstCheckbox = checkboxes[0];
    if (firstCheckbox) {
        firstCheckbox.checked = true;
        toggleProjectCard(firstCheckbox.closest('.project-card'), true);
    }
    
    updateSubmitButton();
}

// 显示加载状态
function showLoading() {
    const nextBtn = document.querySelector('.btn-primary');
    nextBtn.innerHTML = '<span>提交中...</span>';
    nextBtn.disabled = true;
}

// 隐藏加载状态
function hideLoading() {
    const nextBtn = document.querySelector('.btn-primary');
    nextBtn.innerHTML = '下一步';
    nextBtn.disabled = false;
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 20px',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        zIndex: '1000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    // 根据类型设置背景色
    switch (type) {
        case 'success':
            toast.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            toast.style.backgroundColor = '#F44336';
            break;
        default:
            toast.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // 3秒后移除
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}