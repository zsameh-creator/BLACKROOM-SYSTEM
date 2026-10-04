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

  // 4. أجهزة البلايستيشن
  const [devices, setDevices] = useState([
    { id: 1, name: 'PS5 - 01', type: 'Single', status: 'available', seconds: 0, items: [] },
    { id: 2, name: 'PS5 - 02', type: 'Multi', status: 'available', seconds: 0, items: [] },
    { id: 3, name: 'PS4 - 03', type: 'Single', status: 'available', seconds: 0, items: [] },
    { id: 4, name: 'PS5 - 04', type: 'Multi', status: 'available', seconds: 0, items: [] },
  ]);

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

  const handleUpdateUser = (id) => {
    setUsersList(usersList.map(u => {
      if (u.id === id) {
        return {
          ...u,
          password: editPassword ? editPassword : u.password,
          role: editRole,
          permissions: editRole === 'admin' ? { ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true } : editPerms
        };
      }
      return u;
    }));
    setEditingUserId(null);
    setEditPassword('');
    alert('تم تحديث المستخدم والصلاحيات بنجاح!');
  };

  const totalRevenue = shiftInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalExpenses = expenses.reduce((s, ex) => s + ex.amount, 0);
  const netRevenue = totalRevenue - totalExpenses;

  const totalDevicesCount = devices.length;
  const busyDevicesCount = devices.filter(d => d.status === 'busy').length;
  const availableDevicesCount = devices.filter(d => d.status === 'available').length;

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

  const userPerms = currentUser.permissions || { ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true };

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
            <button onClick={() => setActiveTab('ps')} style={{ padding: '12px 15px', background: activeTab === 'ps' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#fff', border: activeTab === 'ps' ? '1px solid rgba(56,189,248,0.5)' : 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold', boxShadow: activeTab === 'ps' ? '0 0 15px rgba(2,132,199,0.4)' : 'none' }}>
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
          <div style={{ background: '#020408', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.3)', textAlign: 'center', fontSize: '13px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
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
                <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px', textShadow: '0 0 20px rgba(56,189,248,0.3)' }}>إدارة أجهزة البلايستيشن</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>ابدأ الجلسات وتحكم في الأجهزة بسهولة وبمظهر تريندي أنيق</p>
              </div>

              {/* شريط الإحصائيات التريندي */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>الأجهزة المتاحة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#22c55e', textShadow: '0 0 10px rgba(34,197,94,0.4)' }}>{availableDevicesCount}</div>
                </div>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(56,189,248,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>الأجهزة المشغولة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>{busyDevicesCount}</div>
                </div>
                <div className="neon-card" style={{ padding: '10px 18px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(168,85,247,0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>إجمالي الأجهزة</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#c084fc', textShadow: '0 0 10px rgba(168,85,247,0.4)' }}>{totalDevicesCount}</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {devices.map(dev => {
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
                      <div style={{ fontSize: '30px', fontWeight: '900', fontFamily: 'monospace', color: dev.status === 'busy' ? '#38bdf8' : '#64748b', margin: '15px 0', textShadow: dev.status === 'busy' ? '0 0 15px rgba(56,189,248,0.3)' : 'none' }}>
                        {formatTime(dev.seconds)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '15px', background: '#020408', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>الحساب الحالي:</span>
                        <span style={{ color: '#22c55e', fontWeight: '900', fontSize: '16px' }}>{currentTotal} ج.م</span>
                      </div>
                    </div>

                    {dev.status === 'available' ? (
                      <button onClick={() => setStartingDeviceModal(dev)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,132,199,0.4)' }}>
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
                        <button onClick={() => prepareCheckout(dev)} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220,38,38,0.3)' }}>
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
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>مبيعات الكافتيريا والمشاريب</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              {products.map(p => (
                <div key={p.id} className="neon-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '10px' }}>{p.name}</h3>
                  <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '18px', marginBottom: '15px' }}>{p.price} ج.م</p>
                  <button onClick={() => {
                    const inv = { id: Date.now(), deviceName: 'مبيعات كافتيريا', date: new Date().toISOString().split('T')[0], type: 'مبيعات خارجية', timeSpent: '-', timeCost: 0, items: [{...p, qty: 1}], itemsCost: p.price, discount: 0, total: p.price, paymentMethod: settings.paymentMethods[0] || 'كاش', time: new Date().toLocaleTimeString('ar-EG') };
                    setShiftInvoices(prev => [inv, ...prev]);
                    alert(`تم بيع ${p.name} بنجاح!`);
                  }} style={{ padding: '10px 15px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>بيع سريع ⚡</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>المصروفات اليومية</h1>
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', maxWidth: '500px', marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#38bdf8' }}>سبب المصروف</label>
                <input type="text" value={expTitle} onChange={e=>setExpTitle(e.target.value)} placeholder="مثال: كهرباء، بوفيه..." style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#38bdf8' }}>المبلغ (ج.م)</label>
                <input type="number" value={expAmount} onChange={e=>setExpAmount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
              </div>
              <button onClick={() => {
                if(!expTitle || !expAmount) return;
                setExpenses([...expenses, { id: Date.now(), title: expTitle, amount: Number(expAmount) }]);
                setExpTitle(''); setExpAmount('');
                alert('تم تسجيل المصروف بنجاح!');
              }} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>إضافة مصروف 💸</button>
            </div>
          </div>
        )}

        {/* تقرير الوردية الحالية */}
        {activeTab === 'shift' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>تقرير الوردية الحالية (#{shiftNumber})</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '20px 0' }}>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #38bdf8' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>إجمالي الإيرادات</p>
                <h3 style={{ color: '#38bdf8', fontSize: '24px', marginTop: '5px' }}>{totalRevenue} ج.م</h3>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #ef4444' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>إجمالي المصروفات</p>
                <h3 style={{ color: '#ef4444', fontSize: '24px', marginTop: '5px' }}>{totalExpenses} ج.م</h3>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #22c55e' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>صافي الوردية</p>
                <h3 style={{ color: '#22c55e', fontSize: '24px', marginTop: '5px' }}>{netRevenue} ج.م</h3>
              </div>
            </div>

            {/* تفصيل الإيرادات حسب طريقة الدفع */}
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>💳 تفصيل الإيرادات حسب طريقة الدفع</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {settings.paymentMethods.map(method => (
                  <div key={method} style={{ background: '#020408', padding: '15px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{method}</p>
                    <h4 style={{ margin: '8px 0 0 0', color: '#22c55e', fontSize: '18px' }}>{revenueByPayment[method] || 0} ج.م</h4>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={closeShift} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>
              🔒 إغلاق الوردية وأرشفتها رسمياً
            </button>
          </div>
        )}

        {/* الأرشيف */}
        {activeTab === 'archive' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>📂 الأرشيف والتقارير المخصصة</h1>
            <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>من تاريخ</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>إلى تاريخ</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff' }} />
              </div>
              <button onClick={() => { setFromDate(''); setToDate(''); }} style={{ padding: '11px 20px', background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '18px', fontWeight: 'bold' }}>إلغاء الفلتر</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>إيرادات الفترة</p>
                <h3 style={{ color: '#38bdf8', fontSize: '22px', marginTop: '5px' }}>{filteredTotalRev} ج.م</h3>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>مصروفات الفترة</p>
                <h3 style={{ color: '#ef4444', fontSize: '22px', marginTop: '5px' }}>{filteredTotalExp} ج.م</h3>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>صافي الربح</p>
                <h3 style={{ color: '#22c55e', fontSize: '22px', marginTop: '5px' }}>{filteredNetRev} ج.م</h3>
              </div>
            </div>

            <h3>الورديات المؤرشفة السابقة</h3>
            {filteredShifts.length === 0 ? (
              <p style={{ color: '#94a3b8', marginTop: '10px' }}>لا توجد ورديات مسجلة في هذه الفترة.</p>
            ) : (
              filteredShifts.map(sh => (
                <div key={sh.id} className="neon-card" style={{ padding: '15px 20px', borderRadius: '14px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>وردية #{sh.shiftNumber}</span> — التاريخ: <b>{sh.date}</b> — المسؤول: <b>{sh.cashier}</b>
                  </div>
                  <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px' }}>الصافي: {sh.netRevenue} ج.م</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* إدارة المستخدمين */}
        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>👥 إدارة المستخدمين والصلاحيات المخصصة</h1>
            
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>إضافة مستخدم جديد وتخصيص صلاحياته</h3>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <input type="text" placeholder="الاسم الكامل" value={newFullName} onChange={e=>setNewFullName(e.target.value)} style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                  <input type="text" placeholder="اسم المستخدم (Login)" value={newUsername} onChange={e=>setNewUsername(e.target.value)} style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                  <input type="password" placeholder="كلمة المرور" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                  <select value={newRole} onChange={e=>setNewRole(e.target.value)} style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                    <option value="user">موظف (مخصص الصلاحيات)</option>
                    <option value="admin">مدير عام (صلاحيات كاملة)</option>
                  </select>
                </div>

                {newRole === 'user' && (
                  <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>حدد الأقسام المسموح له بدخولها:</p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <label><input type="checkbox" checked={newPerms.ps} onChange={e=>setNewPerms({...newPerms, ps: e.target.checked})} /> أجهزة البلايستيشن</label>
                      <label><input type="checkbox" checked={newPerms.drinks} onChange={e=>setNewPerms({...newPerms, drinks: e.target.checked})} /> المشاريب</label>
                      <label><input type="checkbox" checked={newPerms.expenses} onChange={e=>setNewPerms({...newPerms, expenses: e.target.checked})} /> المصروفات</label>
                      <label><input type="checkbox" checked={newPerms.shift} onChange={e=>setNewPerms({...newPerms, shift: e.target.checked})} /> تقرير الوردية</label>
                      <label><input type="checkbox" checked={newPerms.archive} onChange={e=>setNewPerms({...newPerms, archive: e.target.checked})} /> الأرشيف</label>
                      <label><input type="checkbox" checked={newPerms.users} onChange={e=>setNewPerms({...newPerms, users: e.target.checked})} /> المستخدمين</label>
                      <label><input type="checkbox" checked={newPerms.settings} onChange={e=>setNewPerms({...newPerms, settings: e.target.checked})} /> الإعدادات</label>
                    </div>
                  </div>
                )}

                <button type="submit" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>حفظ وإضافة المستخدم</button>
              </form>
            </div>

            <h3>المستخدمون المسجلون</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              {usersList.map(u => (
                <div key={u.id} className="neon-card" style={{ padding: '15px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{u.fullName}</span> <span style={{ color: '#94a3b8', fontSize: '13px' }}>({u.username})</span>
                    <div style={{ marginTop: '5px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: u.role === 'admin' ? '#7c3aed' : '#0284c7', color: '#fff' }}>
                        {u.role === 'admin' ? 'مدير النظام' : 'موظف'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {editingUserId === u.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="password" placeholder="باسورد جديد" value={editPassword} onChange={e=>setEditPassword(e.target.value)} style={{ padding: '8px', width: '120px', background: '#020408', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                        <select value={editRole} onChange={e=>{
                          setEditRole(e.target.value);
                          if(e.target.value === 'admin') setEditPerms({ ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true });
                          else setEditPerms(u.permissions || {});
                        }} style={{ padding: '8px', background: '#020408', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', outline: 'none' }}>
                          <option value="user">موظف</option>
                          <option value="admin">مدير</option>
                        </select>
                        <button onClick={()=>handleUpdateUser(u.id)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ</button>
                        <button onClick={()=>setEditingUserId(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>إلغاء</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={()=>{ setEditingUserId(u.id); setEditPassword(''); setEditRole(u.role); setEditPerms(u.permissions || {}); }} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>تعديل</button>
                        {u.username !== 'zead' && (
                          <button onClick={()=>handleDeleteUser(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حذف</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الإعدادات العامة */}
        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>الإعدادات العامة للسيستم</h1>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>تعديل الأسعار وإدارة طرق الدفع المعتمدة</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>أسعار الساعات</h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>سعر ساعة الفردي (ج.م)</label>
                  <input type="number" value={settings.singlePrice} onChange={e=>setSettings({...settings, singlePrice: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>سعر ساعة الملتي/الزوجي (ج.م)</label>
                  <input type="number" value={settings.multiPrice} onChange={e=>setSettings({...settings, multiPrice: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                </div>
              </div>

              <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>إدارة طرق الدفع</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input type="text" placeholder="طريقة دفع جديدة..." value={newPayment} onChange={e=>setNewPayment(e.target.value)} style={{ flex: 1, padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                  <button onClick={()=>{
                    if(!newPayment) return;
                    if(settings.paymentMethods.includes(newPayment)) return;
                    setSettings({...settings, paymentMethods: [...settings.paymentMethods, newPayment]});
                    setNewPayment('');
                  }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {settings.paymentMethods.map((m, idx) => (
                    <div key={idx} style={{ background: '#020408', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(56,189,248,0.1)' }}>
                      <span>{m}</span>
                      {settings.paymentMethods.length > 1 && (
                        <button onClick={()=>{
                          setSettings({...settings, paymentMethods: settings.paymentMethods.filter(item => item !== m)});
                        }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>حذف</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* مودال بدء الجلسة */}
      {startingDeviceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '350px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#38bdf8' }}>بدء جلسة لـ {startingDeviceModal.name}</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
              <button onClick={() => setSelectedStartType('Single')} style={{ flex: 1, padding: '12px', background: selectedStartType === 'Single' ? '#0284c7' : '#020408', color: '#fff', border: '1px solid #0284c7', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>سنجل 👤</button>
              <button onClick={() => setSelectedStartType('Multi')} style={{ flex: 1, padding: '12px', background: selectedStartType === 'Multi' ? '#0284c7' : '#020408', color: '#fff', border: '1px solid #0284c7', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>ملتي 👥</button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmStartSession} style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد البدء</button>
              <button onClick={() => setStartingDeviceModal(null)} style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إنهاء الفاتورة */}
      {checkoutDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '420px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#38bdf8' }}>دفع وحساب {checkoutDevice.name}</h3>
            
            <div style={{ marginBottom: '15px', fontSize: '14px', color: '#94a3b8', background: '#020408', padding: '10px', borderRadius: '10px' }}>
              وقت الجلسة: <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>{formatTime(checkoutDevice.seconds)}</span>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>طريقة الدفع:</label>
              <select value={selectedPaymentMethod} onChange={e=>setSelectedPaymentMethod(e.target.value)} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                {settings.paymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>خصم (ج.م):</label>
              <input type="number" value={discountAmount} onChange={e=>setDiscountAmount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowPreviewModal(true)} style={{ flex: 1, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>معاينة الفاتورة 👁️</button>
              <button onClick={() => setCheckoutDevice(null)} style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال معاينة تفاصيل الفاتورة */}
      {showPreviewModal && checkoutDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#22c55e', textAlign: 'center' }}>📋 معاينة تفاصيل الفاتورة</h3>
            
            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>اسم الجهاز: <b style={{ color: '#38bdf8' }}>{checkoutDevice.name}</b> ({checkoutDevice.type === 'Single' ? 'سنجل' : 'ملتي'})</div>
              <div>الوقت المستغرق: <b style={{ fontFamily: 'monospace' }}>{formatTime(checkoutDevice.seconds)}</b></div>
              <div>تاريخ ووقت الإصدار: {new Date().toLocaleString('ar-EG')}</div>
              <div>طريقة الدفع المختارة: <b style={{ color: '#facc15' }}>{selectedPaymentMethod}</b></div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#94a3b8' }}>تكلفة الوقت:</div>
              <div style={{ background: '#020408', padding: '10px', borderRadius: '8px' }}>
                {Math.round((checkoutDevice.seconds / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice))} ج.م
              </div>
            </div>

            {checkoutDevice.items.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#94a3b8' }}>المنتجات والمشاريب المضافة:</div>
                <div style={{ background: '#020408', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {checkoutDevice.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>{it.name} (×{it.qty})</span>
                      <span>{it.price * it.qty} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px', background: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid #22c55e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>الإجمالي النهائي:</span>
              <span style={{ color: '#22c55e', fontWeight: '900', fontSize: '18px' }}>
                {Math.max(0, Math.round((checkoutDevice.seconds / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice)) + checkoutDevice.items.reduce((s, i) => s + (i.price * i.qty), 0) - (discountAmount ? Number(discountAmount) : 0))} ج.م
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={finalizeCheckout} style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد وإغلاق نهائي ✅</button>
              <button onClick={() => setShowPreviewModal(false)} style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>الرجوع للتعديل</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة منتج */}
      {addingItemDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#38bdf8' }}>اختر منتج لإضافته لـ {addingItemDevice.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', marginBottom: '15px' }}>
              {products.map(prod => (
                <div key={prod.id} onClick={() => addProductToDevice(addingItemDevice.id, prod)} style={{ background: '#020408', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <span>{prod.name}</span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{prod.price} ج.م</span>
                </div>
              ))}
            </div>
            <button onClick={() => setAddingItemDevice(null)} style={{ width: '100%', padding: '10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
          </div>
        </div>
      )}

    </div>
  );
}