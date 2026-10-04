import { useState, useEffect } from 'react';

export default function App() {
  // 1. حالة تسجيل الدخول والصلاحيات
  const [currentUser, setCurrentUser] = useState(null);
  const [loginInputUser, setLoginInputUser] = useState('');
  const [loginInputPass, setLoginInputPass] = useState('');

  // 2. قاعدة بيانات المستخدمين (مع الصلاحيات التفصيلية)
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('ps_users_db');
    return saved ? JSON.parse(saved) : [
      { id: 1, username: 'zead', password: '123', role: 'admin', fullName: 'المدير العام (Zead)', permissions: { ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true } },
      { id: 2, username: 'cashier', password: '111', role: 'user', fullName: 'موظف الاستقبال', permissions: { ps: true, drinks: true, expenses: true, shift: true, archive: false, users: false, settings: false } }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ps_users_db', JSON.stringify(usersList));
  }, [usersList]);

  const [activeTab, setActiveTab] = useState('ps');

  // 3. الإعدادات العامة (الأسعار وطرق الدفع)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ps_settings');
    return saved ? JSON.parse(saved) : {
      singlePrice: 40,
      multiPrice: 60,
      paymentMethods: ['كاش (Cash)', 'فودافون كاش', 'إنستا باي']
    };
  });

  useEffect(() => {
    localStorage.setItem('ps_settings', JSON.stringify(settings));
  }, [settings]);

  // 4. أجهزة البلايستيشن
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('ps_devices_db');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'PS5 - 01', type: 'Single', status: 'available', seconds: 0, items: [] },
      { id: 2, name: 'PS5 - 02', type: 'Multi', status: 'available', seconds: 0, items: [] },
      { id: 3, name: 'PS4 - 03', type: 'Single', status: 'available', seconds: 0, items: [] },
      { id: 4, name: 'PS5 - 04', type: 'Multi', status: 'available', seconds: 0, items: [] },
    ];
  });

  useEffect(() => {
    localStorage.setItem('ps_devices_db', JSON.stringify(devices));
  }, [devices]);

  // إعدادات إدارة الأجهزة الجديدة في صفحة الإعدادات
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('Single');
  const [newDevStatus, setNewDevStatus] = useState('available');
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editDevName, setEditDevName] = useState('');
  const [editDevType, setEditDevType] = useState('Single');
  const [editDevStatus, setEditDevStatus] = useState('available');

  // 5. المنتجات والمشاريب
  const [products, setProducts] = useState([
    { id: 1, name: 'بيبسي (Pepsi)', price: 15 },
    { id: 2, name: 'مياه معدنية (Water)', price: 10 },
    { id: 3, name: 'شاي (Tea)', price: 12 }
  ]);

  // 6. النوافذ المؤقتة والمعاينة (Checkout & Preview)
  const [checkoutDevice, setCheckoutDevice] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [addingItemDevice, setAddingItemDevice] = useState(null);
  const [startingDeviceModal, setStartingDeviceModal] = useState(null);
  const [selectedStartType, setSelectedStartType] = useState('Single');

  // 7. الوردية الحالية والمصروفات والأرشيف
  const [shiftInvoices, setShiftInvoices] = useState(() => {
    const saved = localStorage.getItem('ps_shift_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [shiftNumber, setShiftNumber] = useState(() => {
    const saved = localStorage.getItem('ps_shift_number');
    return saved ? JSON.parse(saved) : 1;
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('ps_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');

  useEffect(() => {
    localStorage.setItem('ps_shift_invoices', JSON.stringify(shiftInvoices));
  }, [shiftInvoices]);

  useEffect(() => {
    localStorage.setItem('ps_shift_number', JSON.stringify(shiftNumber));
  }, [shiftNumber]);

  useEffect(() => {
    localStorage.setItem('ps_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const [archivedShifts, setArchivedShifts] = useState(() => {
    const saved = localStorage.getItem('ps_archived_shifts');
    return saved ? JSON.parse(saved) : [];
  });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    localStorage.setItem('ps_archived_shifts', JSON.stringify(archivedShifts));
  }, [archivedShifts]);

  // 8. حالات لوحة تحكم المستخدمين الجدد والصلاحيات
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newPerms, setNewPerms] = useState({
    ps: true, drinks: true, expenses: true, shift: true, archive: true, users: false, settings: false
  });

  // العداد التلقائي
  useEffect(() => {
    const timer = setInterval(() => {
      setDevices(prev => prev.map(d => d.status === 'busy' ? { ...d, seconds: d.seconds + 1 } : d));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = usersList.find(u => u.username === loginInputUser && u.password === loginInputPass);
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveTab('ps');
    } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة!');
    }
  };

  const confirmStartSession = () => {
    if (!startingDeviceModal) return;
    setDevices(prev => prev.map(d => d.id === startingDeviceModal.id ? { ...d, status: 'busy', type: selectedStartType, seconds: 0, items: [] } : d));
    setStartingDeviceModal(null);
  };

  const toggleDeviceTypeMidSession = (id) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const nextType = d.type === 'Single' ? 'Multi' : 'Single';
        return { ...d, type: nextType };
      }
      return d;
    }));
  };

  const addProductToDevice = (deviceId, product) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const existing = d.items.find(i => i.id === product.id);
        if (existing) {
          return { ...d, items: d.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
        } else {
          return { ...d, items: [...d.items, { ...product, qty: 1 }] };
        }
      }
      return d;
    }));
    setAddingItemDevice(null);
  };

  const prepareCheckout = (dev) => {
    setCheckoutDevice(dev);
    setSelectedPaymentMethod(settings.paymentMethods[0] || 'كاش (Cash)');
    setDiscountAmount('');
    setShowPreviewModal(true);
  };

  const finalizeCheckout = () => {
    if (!checkoutDevice) return;
    const pricePerHour = checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice;
    const timeCost = Math.round((checkoutDevice.seconds / 3600) * pricePerHour);
    const itemsCost = checkoutDevice.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subTotal = timeCost + itemsCost;
    const discount = discountAmount !== '' ? Number(discountAmount) : 0;
    const totalAmount = Math.max(0, subTotal - discount);

    const invoiceData = {
      id: Date.now(),
      deviceName: checkoutDevice.name,
      date: new Date().toISOString().split('T')[0],
      type: checkoutDevice.type === 'Single' ? 'سنجل' : 'ملتي',
      timeSpent: formatTime(checkoutDevice.seconds),
      timeCost,
      items: checkoutDevice.items,
      itemsCost,
      discount,
      total: totalAmount,
      paymentMethod: selectedPaymentMethod || settings.paymentMethods[0],
      time: new Date().toLocaleTimeString('ar-EG')
    };

    setShiftInvoices(prev => [invoiceData, ...prev]);
    setDevices(prev => prev.map(d => d.id === checkoutDevice.id ? { ...d, status: 'available', seconds: 0, items: [] } : d));
    setShowPreviewModal(false);
    setCheckoutDevice(null);
    alert('تم إغلاق الفاتورة ودفع الحساب بنجاح!');
  };

  const closeShift = () => {
    if (currentUser?.role !== 'admin' && !currentUser?.permissions?.shift) {
      alert('عذراً، لا تمتلك الصلاحية لإنهاء الوردية وأرشفتها!');
      return;
    }
    if (shiftInvoices.length === 0 && expenses.length === 0) {
      alert('لا توجد معاملات مسجلة في الوردية الحالية!');
      return;
    }

    const totalRev = shiftInvoices.reduce((s, inv) => s + inv.total, 0);
    const totalExp = expenses.reduce((s, ex) => s + ex.amount, 0);

    const shiftArchive = {
      id: Date.now(),
      shiftNumber,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      cashier: currentUser.fullName || currentUser.username,
      invoices: [...shiftInvoices],
      expenses: [...expenses],
      totalRevenue: totalRev,
      totalExpenses: totalExp,
      netRevenue: totalRev - totalExp
    };

    setArchivedShifts(prev => [...prev, shiftArchive]);
    alert(`تم إغلاق الوردية رقم ${shiftNumber} وأرشفتها بنجاح!`);
    setShiftInvoices([]);
    setExpenses([]);
    setShiftNumber(prev => prev + 1);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newFullName) return;
    if (usersList.some(u => u.username === newUsername)) {
      alert('اسم المستخدم موجود مسبقاً!');
      return;
    }
    const newUser = {
      id: Date.now(),
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      role: newRole,
      permissions: newRole === 'admin' ? { ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true } : newPerms
    };
    setUsersList([...usersList, newUser]);
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewRole('user');
    alert('تم إضافة المستخدم وصلاحياته بنجاح!');
  };

  const handleDeleteUser = (id) => {
    if (usersList.length <= 1) {
      alert('لا يمكن حذف كل المستخدمين!');
      return;
    }
    if (usersList.find(u => u.id === id)?.username === 'zead') {
      alert('لا يمكن حذف حساب الأدمن الأساسي!');
      return;
    }
    setUsersList(usersList.filter(u => u.id !== id));
  };

  // إدارة أجهزة البلايستيشن من الإعدادات (إضافة، تعديل، حذف)
  const handleAddDevice = (e) => {
    e.preventDefault();
    if (!newDevName) return;
    const newDevice = {
      id: Date.now(),
      name: newDevName,
      type: newDevType,
      status: newDevStatus,
      seconds: 0,
      items: []
    };
    setDevices([...devices, newDevice]);
    setNewDevName('');
    alert('تم إضافة الجهاز بنجاح!');
  };

  const handleDeleteDevice = (id) => {
    if (devices.length <= 1) {
      alert('لا يمكن حذف كل الأجهزة!');
      return;
    }
    setDevices(devices.filter(d => d.id !== id));
  };

  const handleUpdateDevice = (id) => {
    setDevices(devices.map(d => {
      if (d.id === id) {
        return {
          ...d,
          name: editDevName || d.name,
          type: editDevType,
          status: editDevStatus
        };
      }
      return d;
    }));
    setEditingDeviceId(null);
    alert('تم تحديث بيانات الجهاز بنجاح!');
  };

  const totalRevenue = shiftInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalExpenses = expenses.reduce((s, ex) => s + ex.amount, 0);
  const netRevenue = totalRevenue - totalExpenses;

  const totalDevicesCount = devices.length;
  const busyDevicesCount = devices.filter(d => d.status === 'busy').length;
  const availableDevicesCount = devices.filter(d => d.status === 'available').length;
  const maintenanceDevicesCount = devices.filter(d => d.status === 'maintenance').length;

  const revenueByPayment = settings.paymentMethods.reduce((acc, method) => {
    acc[method] = shiftInvoices
      .filter(inv => inv.paymentMethod === method)
      .reduce((sum, inv) => sum + inv.total, 0);
    return acc;
  }, {});

  const filteredShifts = archivedShifts.filter(sh => {
    if (!fromDate && !toDate) return true;
    if (fromDate && !toDate) return sh.date >= fromDate;
    if (!fromDate && toDate) return sh.date <= toDate;
    return sh.date >= fromDate && sh.date <= toDate;
  });

  const filteredTotalRev = filteredShifts.reduce((s, sh) => s + sh.totalRevenue, 0);
  const filteredTotalExp = filteredShifts.reduce((s, sh) => s + sh.totalExpenses, 0);
  const filteredNetRev = filteredShifts.reduce((s, sh) => s + sh.netRevenue, 0);

  if (!currentUser) {
    return (
      <div dir="rtl" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#03050a', color: '#fff', fontFamily: 'Cairo, sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&family=Cairo:wght@400;600;700;900&display=swap');
          .neon-brand { font-family: 'Outfit', sans-serif; letter-spacing: 2px; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .login-card { background: linear-gradient(145deg, #0d1224 0%, #05070f 100%); border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 0 40px rgba(56, 189, 248, 0.2); }
        `}</style>
        <div className="login-card" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 className="neon-brand" style={{ fontSize: '28px', fontWeight: '950', marginBottom: '8px' }}>BLACK ROOM</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '30px' }}>تسجيل الدخول لنظام إدارة البلايستيشن</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'right' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>اسم المستخدم</label>
              <input type="text" value={loginInputUser} onChange={e=>setLoginInputUser(e.target.value)} placeholder="أدخل اسم المستخدم" style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.4)', color: '#fff', borderRadius: '12px', outline: 'none' }} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>كلمة المرور</label>
              <input type="password" value={loginInputPass} onChange={e=>setLoginInputPass(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.4)', color: '#fff', borderRadius: '12px', outline: 'none' }} required />
            </div>
            <button type="submit" style={{ marginTop: '10px', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 0 20px rgba(2,132,199,0.5)' }}>
              دخول للنظام 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: 'flex', minHeight: '100vh', background: '#03050a', color: '#fff', fontFamily: 'Cairo, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&family=Cairo:wght@400;600;700;900&display=swap');
        .neon-brand { font-family: 'Outfit', sans-serif; letter-spacing: 2px; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .neon-sidebar { background: linear-gradient(180deg, #070b16 0%, #03050a 100%); border-left: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 5px 0 25px rgba(0,0,0,0.5); }
        .neon-card { background: linear-gradient(145deg, #0b1120 0%, #05070f 100%); border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); transition: all 0.3s ease; }
        .neon-card:hover { border-color: rgba(56, 189, 248, 0.5); box-shadow: 0 0 25px rgba(56, 189, 248, 0.15); }
      `}</style>

      {/* القائمة الجانبية */}
      <div className="neon-sidebar" style={{ width: '280px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <div style={{ padding: '15px 10px', marginBottom: '25px', borderBottom: '1px solid rgba(56,189,248,0.2)' }}>
            <h2 className="neon-brand" style={{ fontSize: '24px', fontWeight: '950' }}>BLACK ROOM</h2>
            <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>LIZA SYSTEM</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('ps')} style={{ padding: '12px 15px', background: activeTab === 'ps' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'ps' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
              🎮 أجهزة البلايستيشن
            </button>
            <button onClick={() => setActiveTab('drinks')} style={{ padding: '12px 15px', background: activeTab === 'drinks' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'drinks' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
              🥤 مبيعات المشاريب
            </button>
            <button onClick={() => setActiveTab('expenses')} style={{ padding: '12px 15px', background: activeTab === 'expenses' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'expenses' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
              💸 المصروفات
            </button>
            <button onClick={() => setActiveTab('shift')} style={{ padding: '12px 15px', background: activeTab === 'shift' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'shift' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
              📊 تقرير الوردية الحالي
            </button>
            <button onClick={() => setActiveTab('archive')} style={{ padding: '12px 15px', background: activeTab === 'archive' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'archive' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
              📂 الأرشيف والتقارير
            </button>

            {currentUser.role === 'admin' && (
              <>
                <button onClick={() => setActiveTab('users')} style={{ padding: '12px 15px', background: activeTab === 'users' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'transparent', color: '#fff', border: activeTab === 'users' ? '1px solid rgba(168,85,247,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
                  👥 إدارة المستخدمين
                </button>
                <button onClick={() => setActiveTab('settings')} style={{ padding: '12px 15px', background: activeTab === 'settings' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'settings' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
                  ⚙️ الإعدادات العامة والأجهزة
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: '#020408', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.3)', textAlign: 'center', fontSize: '13px' }}>
            المستخدم: <span style={{ color: '#38bdf8', fontWeight: '900' }}>{currentUser.username}</span>
            <div style={{ fontSize: '11px', color: currentUser.role === 'admin' ? '#22c55e' : '#f59e0b', marginTop: '2px' }}>
              ({currentUser.role === 'admin' ? 'مدير النظام' : 'موظف'})
            </div>
          </div>
          <button onClick={() => setCurrentUser(null)} style={{ padding: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            🚪 تسجيل خروج
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === 'ps' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>إدارة أجهزة البلايستيشن</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>تحكم في الجلسات والأجهزة بكل سهولة</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>المتاحة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#22c55e' }}>{availableDevicesCount}</div>
                </div>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(56,189,248,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>المشغولة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>{busyDevicesCount}</div>
                </div>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>في الصيانة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{maintenanceDevicesCount}</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {devices.map(dev => {
                const pricePerHour = dev.type === 'Single' ? settings.singlePrice : settings.multiPrice;
                const timeCost = Math.round((dev.seconds / 3600) * pricePerHour);
                const itemsCost = dev.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
                const currentTotal = timeCost + itemsCost;

                if (dev.status === 'maintenance') {
                  return (
                    <div key={dev.id} className="neon-card" style={{ padding: '22px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.03)' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{dev.name}</h3>
                          <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                            🔧 في الصيانة
                          </span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: '30px 0' }}>الجهاز متوقف حالياً للصيانة الفنية.</p>
                      </div>
                      {currentUser.role === 'admin' && (
                        <button onClick={() => {
                          setDevices(devices.map(d => d.id === dev.id ? { ...d, status: 'available' } : d));
                        }} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          إعادة للخدمة ✅
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={dev.id} className="neon-card" style={{ padding: '22px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: dev.status === 'busy' ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(34,197,94,0.3)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{dev.name}</h3>
                        <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: dev.status === 'busy' ? 'rgba(2,132,199,0.2)' : 'rgba(34,197,94,0.2)', color: dev.status === 'busy' ? '#38bdf8' : '#22c55e', border: dev.status === 'busy' ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(34,197,94,0.4)' }}>
                          {dev.status === 'busy' ? (dev.type === 'Single' ? 'سنجل 👤' : 'ملتي 👥') : 'متاح ✅'}
                        </span>
                      </div>
                      <div style={{ fontSize: '30px', fontWeight: '900', fontFamily: 'monospace', color: dev.status === 'busy' ? '#38bdf8' : '#64748b', margin: '15px 0' }}>
                        {formatTime(dev.seconds)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '15px', background: '#020408', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>الحساب الحالي:</span>
                        <span style={{ color: '#22c55e', fontWeight: '900', fontSize: '16px' }}>{currentTotal} ج.م</span>
                      </div>
                    </div>

                    {dev.status === 'available' ? (
                      <button onClick={() => setStartingDeviceModal(dev)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        بدء جلسة جديدة 🚀
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={() => toggleDeviceTypeMidSession(dev.id)} style={{ width: '100%', padding: '9px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                          🔄 تحويل إلى ({dev.type === 'Single' ? 'ملتي 👥' : 'سنجل 👤'})
                        </button>
                        <button onClick={() => setAddingItemDevice(dev)} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          + إضافة منتج 🥤
                        </button>
                        <button onClick={() => prepareCheckout(dev)} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          إنهاء الفاتورة والدفع 💳
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* إعدادات النظام وأجهزة البلايستيشن */}
        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>⚙️ الإعدادات العامة وإدارة الأجهزة</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {/* تعديل أسعار الساعة */}
              <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>💰 تعديل أسعار الساعة</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>سعر السنجل (ج.م / ساعة)</label>
                    <input type="number" value={settings.singlePrice} onChange={e=>setSettings({...settings, singlePrice: Number(e.target.value)})} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>سعر الملتي (ج.م / ساعة)</label>
                    <input type="number" value={settings.multiPrice} onChange={e=>setSettings({...settings, multiPrice: Number(e.target.value)})} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              {/* إضافة جهاز بلايستيشن جديد */}
              <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>🎮 إضافة جهاز بلايستيشن جديد</h3>
                <form onSubmit={handleAddDevice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" value={newDevName} onChange={e=>setNewDevName(e.target.value)} placeholder="اسم الجهاز (مثال: PS5 - 05)" style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                  <select value={newDevType} onChange={e=>setNewDevType(e.target.value)} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                    <option value="Single">سنجل (Single)</option>
                    <option value="Multi">ملتي (Multi)</option>
                  </select>
                  <select value={newDevStatus} onChange={e=>setNewDevStatus(e.target.value)} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                    <option value="available">متاح للعمل</option>
                    <option value="maintenance">في الصيانة 🔧</option>
                  </select>
                  <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة الجهاز 🚀</button>
                </form>
              </div>
            </div>

            {/* قائمة وتعديل الأجهزة (حذف، تعديل حالة الصيانة أو الاسم) */}
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>إدارة وتعديل أجهزة البلايستيشن الحالية</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {devices.map(d => (
                  <div key={d.id} style={{ background: '#020408', padding: '18px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    {editingDeviceId === d.id ? (
                      <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input type="text" defaultValue={d.name} onChange={e=>setEditDevName(e.target.value)} placeholder="اسم الجهاز" style={{ padding: '8px', background: '#03050a', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '8px' }} />
                        <select defaultValue={d.type} onChange={e=>setEditDevType(e.target.value)} style={{ padding: '8px', background: '#03050a', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '8px' }}>
                          <option value="Single">سنجل</option>
                          <option value="Multi">ملتي</option>
                        </select>
                        <select defaultValue={d.status} onChange={e=>setEditDevStatus(e.target.value)} style={{ padding: '8px', background: '#03050a', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '8px' }}>
                          <option value="available">شغال / متاح</option>
                          <option value="maintenance">في الصيانة 🔧</option>
                        </select>
                        <button onClick={() => handleUpdateDevice(d.id)} style={{ padding: '8px 15px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                        <button onClick={() => setEditingDeviceId(null)} style={{ padding: '8px 15px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{d.name}</h4>
                          <span style={{ fontSize: '12px', color: '#38bdf8' }}>({d.type === 'Single' ? 'سنجل' : 'ملتي'})</span>
                          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '10px', background: d.status === 'maintenance' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: d.status === 'maintenance' ? '#ef4444' : '#22c55e' }}>
                            {d.status === 'maintenance' ? 'في الصيانة 🔧' : 'شغال / متاح ✅'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => { setEditingDeviceId(d.id); setEditDevName(d.name); setEditDevType(d.type); setEditDevStatus(d.status); }} style={{ padding: '8px 15px', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>تعديل</button>
                          <button onClick={() => handleDeleteDevice(d.id)} style={{ padding: '8px 15px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>حذف</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* نوافذ الحوار وبدء الجلسات */}
      {startingDeviceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(3,5,10,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>بدء جلسة لـ {startingDeviceModal.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>اختر نوع اللعب لبدء العداد:</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setSelectedStartType('Single')} style={{ flex: 1, padding: '12px', background: selectedStartType === 'Single' ? '#0284c7' : '#020408', color: '#fff', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>سنجل 👤</button>
              <button onClick={() => setSelectedStartType('Multi')} style={{ flex: 1, padding: '12px', background: selectedStartType === 'Multi' ? '#0284c7' : '#020408', color: '#fff', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ملتي 👥</button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmStartSession} style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد البدء 🚀</button>
              <button onClick={() => setStartingDeviceModal(null)} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة منتج لجهاز */}
      {addingItemDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(3,5,10,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '15px' }}>إضافة منتج لـ {addingItemDevice.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {products.map(p => (
                <button key={p.id} onClick={() => addProductToDevice(addingItemDevice.id, p)} style={{ padding: '12px', background: '#020408', color: '#fff', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                  <span>{p.name}</span>
                  <span style={{ color: '#22c55e' }}>{p.price} ج.م</span>
                </button>
              ))}
            </div>
            <button onClick={() => setAddingItemDevice(null)} style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة معاينة الفاتورة ودفع الحساب */}
      {showPreviewModal && checkoutDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(3,5,10,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '450px', textAlign: 'right', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#38bdf8', marginBottom: '15px', textAlign: 'center' }}>🧾 فاتورة الحساب النهائية</h3>
            
            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>الجهاز:</span>
                <strong>{checkoutDevice.name} ({checkoutDevice.type === 'Single' ? 'سنجل' : 'ملتي'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>وقت اللعب:</span>
                <strong style={{ fontFamily: 'monospace' }}>{formatTime(checkoutDevice.seconds)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>تكلفة الوقت:</span>
                <strong style={{ color: '#22c55e' }}>{Math.round((checkoutDevice.seconds / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice))} ج.م</strong>
              </div>
            </div>

            {checkoutDevice.items.length > 0 && (
              <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)' }}>
                <h4 style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '8px' }}>المشاريب والطلبات:</h4>
                {checkoutDevice.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span>{item.name} (×{item.qty})</span>
                    <span>{item.price * item.qty} ج.م</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#38bdf8', marginBottom: '5px' }}>خصم (ج.م) - اختياري</label>
              <input type="number" value={discountAmount} onChange={e=>setDiscountAmount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#38bdf8', marginBottom: '5px' }}>طريقة الدفع</label>
              <select value={selectedPaymentMethod} onChange={e=>setSelectedPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                {settings.paymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>المبلغ الإجمالي المستحق:</span>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#22c55e', marginTop: '5px' }}>
                {Math.max(0, Math.round((checkoutDevice.seconds / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice)) + checkoutDevice.items.reduce((s, i) => s + (i.price * i.qty), 0) - (discountAmount !== '' ? Number(discountAmount) : 0))} ج.م
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={finalizeCheckout} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد الدفع وإغلاق الفاتورة ✅</button>
              <button onClick={() => setShowPreviewModal(false)} style={{ padding: '12px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}