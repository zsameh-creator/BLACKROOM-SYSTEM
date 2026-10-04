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
  const [newPayment, setNewPayment] = useState('');

  useEffect(() => {
    localStorage.setItem('ps_settings', JSON.stringify(settings));
  }, [settings]);

  // 4. أجهزة البلايستيشن (مدعومة بحالة الصيانة والنشط وحفظها محلياً)
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('ps_devices_db');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'PS5 - 01', type: 'Single', status: 'available', deviceStatus: 'active', seconds: 0, items: [] },
      { id: 2, name: 'PS5 - 02', type: 'Multi', status: 'available', deviceStatus: 'active', seconds: 0, items: [] },
      { id: 3, name: 'PS4 - 03', type: 'Single', status: 'available', deviceStatus: 'active', seconds: 0, items: [] },
      { id: 4, name: 'PS5 - 04', type: 'Multi', status: 'available', deviceStatus: 'maintenance', seconds: 0, items: [] },
    ];
  });

  useEffect(() => {
    localStorage.setItem('ps_devices_db', JSON.stringify(devices));
  }, [devices]);

  // حالات إدارة الأجهزة من الإعدادات
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Single');

  // 5. المنتجات والمشاريب
  const [products, setProducts] = useState([
    { id: 1, name: 'بيبسي (Pepsi)', price: 15 },
    { id: 2, name: 'مياه معدنية (Water)', price: 10 },
    { id: 3, name: 'شاي (Tea)', price: 12 }
  ]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');

  // 6. النوافذ المؤقتة والمعاينة (Checkout & Preview)
  const [checkoutDevice, setCheckoutDevice] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [addingItemDevice, setAddingItemDevice] = useState(null);
  const [startingDeviceModal, setStartingDeviceModal] = useState(null);
  const [selectedStartType, setSelectedStartType] = useState('Single');

  // 7. الوردية الحالية والمصروفات والأرشيف
  const [shiftInvoices, setShiftInvoices] = useState([]);
  const [shiftNumber, setShiftNumber] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');

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

  const [editingUserId, setEditingUserId] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editPerms, setEditPerms] = useState({});

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

  const handleAddDevice = (e) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    const newDev = {
      id: Date.now(),
      name: newDeviceName.trim(),
      type: newDeviceType,
      status: 'available',
      deviceStatus: 'active',
      seconds: 0,
      items: []
    };
    setDevices([...devices, newDev]);
    setNewDeviceName('');
    alert('تم إضافة الجهاز بنجاح!');
  };

  const handleToggleDeviceMaintenance = (id) => {
    setDevices(devices.map(d => {
      if (d.id === id) {
        const nextStatus = d.deviceStatus === 'active' ? 'maintenance' : 'active';
        return { ...d, deviceStatus: nextStatus };
      }
      return d;
    }));
  };

  const handleRenameDevice = (id) => {
    const dev = devices.find(d => d.id === id);
    const newName = prompt('أدخل الاسم الجديد للجهاز:', dev ? dev.name : '');
    if (!newName || !newName.trim()) return;
    setDevices(devices.map(d => d.id === id ? { ...d, name: newName.trim() } : d));
  };

  const handleDeleteDevice = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
      setDevices(devices.filter(d => d.id !== id));
    }
  };

  const totalRevenue = shiftInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalExpenses = expenses.reduce((s, ex) => s + ex.amount, 0);
  const netRevenue = totalRevenue - totalExpenses;

  const totalDevicesCount = devices.length;
  const busyDevicesCount = devices.filter(d => d.status === 'busy').length;
  const availableDevicesCount = devices.filter(d => d.status === 'available').length;

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
              📂 الأرشيف والتقارير المخصصة
            </button>

            {currentUser.role === 'admin' && (
              <>
                <button onClick={() => setActiveTab('users')} style={{ padding: '12px 15px', background: activeTab === 'users' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'transparent', color: '#fff', border: activeTab === 'users' ? '1px solid rgba(168,85,247,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
                  👥 إدارة المستخدمين والصلاحيات
                </button>
                <button onClick={() => setActiveTab('settings')} style={{ padding: '12px 15px', background: activeTab === 'settings' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'settings' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold' }}>
                  ⚙️ الإعدادات العامة (أدمن)
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
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>ابدأ الجلسات وتحكم في الأجهزة بسهولة</p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>الأجهزة المتاحة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#22c55e' }}>{availableDevicesCount}</div>
                </div>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(56,189,248,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>الأجهزة المشغولة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>{busyDevicesCount}</div>
                </div>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(168,85,247,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>إجمالي الأجهزة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#c084fc' }}>{totalDevicesCount}</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {devices.map(dev => {
                if (dev.deviceStatus === 'maintenance') {
                  return (
                    <div key={dev.id} className="neon-card" style={{ padding: '22px', borderRadius: '20px', border: '1px solid rgba(234,179,8,0.4)', opacity: 0.85, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{dev.name}</h3>
                          <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: 'rgba(234,179,8,0.2)', color: '#eab308', border: '1px solid rgba(234,179,8,0.4)' }}>
                            🛠️ في صيانة
                          </span>
                        </div>
                        <p style={{ color: '#eab308', fontSize: '14px', margin: '20px 0', textAlign: 'center' }}>هذا الجهاز متوقف حالياً للصيانة من الإعدادات</p>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>يمكنك إعادة تفعيله من قسم الإعدادات العامة</div>
                    </div>
                  );
                }

                const pricePerHour = dev.type === 'Single' ? settings.singlePrice : settings.multiPrice;
                const timeCost = Math.round((dev.seconds / 3600) * pricePerHour);
                const itemsCost = dev.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
                const currentTotal = timeCost + itemsCost;

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

        {activeTab === 'drinks' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>مبيعات المشاريب والمنتجات</h1>
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '15px' }}>قائمة المنتجات المتاحة</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                {products.map(prod => (
                  <div key={prod.id} style={{ background: '#020408', padding: '15px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{prod.name}</div>
                      <div style={{ color: '#22c55e', fontWeight: '900', marginTop: '5px' }}>{prod.price} ج.م</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>إدارة المصروفات</h1>
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!expTitle.trim() || !expAmount) return;
                setExpenses([...expenses, { id: Date.now(), title: expTitle.trim(), amount: Number(expAmount), time: new Date().toLocaleTimeString('ar-EG') }]);
                setExpTitle('');
                setExpAmount('');
              }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input type="text" placeholder="بيان المصروف (مثال: شراء فحم، صيانة)" value={expTitle} onChange={e=>setExpTitle(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                <input type="number" placeholder="المبلغ (ج.م)" value={expAmount} onChange={e=>setExpAmount(e.target.value)} style={{ width: '130px', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                <button type="submit" style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة مصروف 💸</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expenses.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد مصروفات مسجلة في هذه الوردية</p>
                ) : (
                  expenses.map(ex => (
                    <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020408', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{ex.title}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '10px' }}>({ex.time})</span>
                      </div>
                      <span style={{ color: '#ef4444', fontWeight: '900' }}>- {ex.amount} ج.م</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shift' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900' }}>تقرير الوردية الحالي (وردية رقم {shiftNumber})</h1>
              <button onClick={closeShift} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(220,38,38,0.4)' }}>
                🔒 إغلاق وأرشفة الوردية
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>إجمالي الإيرادات</div>
                <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '900', marginTop: '5px' }}>{totalRevenue} ج.م</div>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>إجمالي المصروفات</div>
                <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: '900', marginTop: '5px' }}>{totalExpenses} ج.م</div>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>صافي الوردية</div>
                <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: '900', marginTop: '5px' }}>{netRevenue} ج.م</div>
              </div>
            </div>

            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '15px' }}>فواتير الوردية المسجلة ({shiftInvoices.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {shiftInvoices.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد فواتير مسجلة حتى الآن</p>
                ) : (
                  shiftInvoices.map(inv => (
                    <div key={inv.id} style={{ background: '#020408', padding: '15px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#38bdf8' }}>{inv.deviceName} ({inv.type})</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>الوقت: {inv.timeSpent} | الدفع: {inv.paymentMethod} | {inv.time}</div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#22c55e' }}>{inv.total} ج.م</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>📂 أرشيف الورديات السابقة</h1>
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              {archivedShifts.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>لا توجد ورديات مؤرشفة حتى الآن</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {archivedShifts.map(sh => (
                    <div key={sh.id} style={{ background: '#020408', padding: '20px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '18px', color: '#38bdf8' }}>وردية رقم #{sh.shiftNumber} ({sh.date})</h3>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>الكاشير: {sh.cashier}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#94a3b8' }}>
                        <div>الإيرادات: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{sh.totalRevenue} ج.م</span></div>
                        <div>المصروفات: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{sh.totalExpenses} ج.م</span></div>
                        <div>الصافي: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{sh.netRevenue} ج.م</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>إدارة المستخدمين والصلاحيات</h1>
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {usersList.map(u => (
                  <div key={u.id} style={{ background: '#020408', padding: '15px 20px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{u.fullName} ({u.username})</div>
                      <div style={{ fontSize: '12px', color: u.role === 'admin' ? '#22c55e' : '#f59e0b', marginTop: '4px' }}>{u.role === 'admin' ? 'مدير عام' : 'موظف'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>الإعدادات العامة للنظام</h1>
            
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '15px' }}>🎮 إدارة أجهزة البلايستيشن (إضافة، تعديل وحالة صيانة)</h3>
              
              <form onSubmit={handleAddDevice} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="اسم الجهاز الجديد (مثال: PS5 - 05)" 
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}
                  required
                />
                <select 
                  value={newDeviceType} 
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}
                >
                  <option value="Single">سنجل (Single)</option>
                  <option value="Multi">ملتي (Multi)</option>
                </select>
                <button type="submit" style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة جهاز ➕</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {devices.map(device => (
                  <div key={device.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020408', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{device.name}</span>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', background: device.deviceStatus === 'maintenance' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)', color: device.deviceStatus === 'maintenance' ? '#eab308' : '#22c55e' }}>
                        {device.deviceStatus === 'maintenance' ? '🛠️ في صيانة' : '🟢 نشط'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleToggleDeviceMaintenance(device.id)} style={{ padding: '6px 12px', background: device.deviceStatus === 'active' ? '#eab308' : '#22c55e', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        {device.deviceStatus === 'active' ? 'تحويل للصيانة 🛠' : 'تفعيل الجهاز 🟢'}
                      </button>
                      <button onClick={() => handleRenameDevice(device.id)} style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        تعديل الاسم ✏️
                      </button>
                      <button onClick={() => handleDeleteDevice(device.id)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        حذف 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '15px' }}>💰 أسعار ساعات اللعب</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>سعر السنجل (ج.م/ساعة)</label>
                  <input type="number" value={settings.singlePrice} onChange={e => setSettings({...settings, singlePrice: Number(e.target.value)})} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>سعر الملتي (ج.م/ساعة)</label>
                  <input type="number" value={settings.multiPrice} onChange={e => setSettings({...settings, multiPrice: Number(e.target.value)})} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px' }} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* نافذة بدء جلسة جديدة */}
      {startingDeviceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="neon-card" style={{ background: '#0d1224', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px', border: '1px solid rgba(56,189,248,0.4)' }}>
            <h3 style={{ fontSize: '20px', color: '#38bdf8', marginBottom: '15px', textAlign: 'center' }}>بدء جلسة: {startingDeviceModal.name}</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>اختر نوع اللعب:</label>
              <select value={selectedStartType} onChange={e => setSelectedStartType(e.target.value)} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.4)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                <option value="Single">سنجل (Single) - {settings.singlePrice} ج.م/ساعة</option>
                <option value="Multi">ملتي (Multi) - {settings.multiPrice} ج.م/ساعة</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmStartSession} style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد وبدء العداد 🚀</button>
              <button onClick={() => setStartingDeviceModal(null)} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة منتج للجهاز */}
      {addingItemDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="neon-card" style={{ background: '#0d1224', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '450px', border: '1px solid rgba(56,189,248,0.4)' }}>
            <h3 style={{ fontSize: '20px', color: '#38bdf8', marginBottom: '15px', textAlign: 'center' }}>إضافة منتج إلى {addingItemDevice.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {products.map(prod => (
                <div key={prod.id} onClick={() => addProductToDevice(addingItemDevice.id, prod)} style={{ background: '#020408', padding: '12px 15px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 'bold' }}>{prod.name}</span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{prod.price} ج.م (+ اضافة)</span>
                </div>
              ))}
            </div>
            <button onClick={() => setAddingItemDevice(null)} style={{ width: '100%', padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة معاينة الفاتورة والدفع */}
      {showPreviewModal && checkoutDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="neon-card" style={{ background: '#0d1224', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '450px', border: '1px solid rgba(34,197,94,0.4)' }}>
            <h3 style={{ fontSize: '22px', color: '#22c55e', marginBottom: '15px', textAlign: 'center' }}>💳 فاتورة نهائية: {checkoutDevice.name}</h3>
            
            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>مدة اللعب ({checkoutDevice.type === 'Single' ? 'سنجل' : 'ملتي'}):</span>
                <span>{formatTime(checkoutDevice.seconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>تكلفة الوقت:</span>
                <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{Math.round((checkoutDevice.seconds / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice))} ج.م</span>
              </div>
              {checkoutDevice.items.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(56,189,248,0.2)', paddingTop: '8px', marginTop: '4px' }}>
                  <div style={{ color: '#94a3b8', marginBottom: '4px' }}>المشاريب والمنتجات المضافة:</div>
                  {checkoutDevice.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingLeft: '10px' }}>
                      <span>{item.name} (x{item.qty})</span>
                      <span>{item.price * item.qty} ج.م</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>خصم (إن وجد بالجنيه):</label>
              <input type="number" placeholder="0" value={discountAmount} onChange={e=>setDiscountAmount(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>طريقة الدفع:</label>
              <select value={selectedPaymentMethod} onChange={e=>setSelectedPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                {settings.paymentMethods.map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={finalizeCheckout} style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>تأكيد الدفع وإغلاق 🚀</button>
              <button onClick={() => setShowPreviewModal(false)} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}