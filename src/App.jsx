import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";

// مفاتيح الاتصال الحقيقية الخاصة بمشروع blackroom-system
const firebaseConfig = {
  apiKey: "AIzaSyB0f2oHZELX8FI6a0rApLlh1McmumjnxWE",
  authDomain: "blackroom-system.firebaseapp.com",
  projectId: "blackroom-system",
  storageBucket: "blackroom-system.firebasestorage.app",
  messagingSenderId: "1060128907829",
  appId: "1:1060128907829:web:3529806e2d92adbea3477c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginInputUser, setLoginInputUser] = useState('');
  const [loginInputPass, setLoginInputPass] = useState('');

  // 1. قاعدة بيانات المستخدمين من Firestore
  const [usersList, setUsersList] = useState([]);
  
  // 2. الإعدادات العامة من Firestore
  const [settings, setSettings] = useState({
    singlePrice: 40,
    multiPrice: 60,
    paymentMethods: ['كاش (Cash)', 'فودافون كاش', 'إنستا باي']
  });

  const [activeTab, setActiveTab] = useState('ps');

  // 3. أجهزة البلايستيشن من Firestore
  const [devices, setDevices] = useState([
    { id: '1', name: 'PS5 - 01', type: 'Single', status: 'available', startTime: null, items: [] },
    { id: '2', name: 'PS5 - 02', type: 'Multi', status: 'available', startTime: null, items: [] },
    { id: '3', name: 'PS4 - 03', type: 'Single', status: 'available', startTime: null, items: [] },
    { id: '4', name: 'PS5 - 04', type: 'Multi', status: 'available', startTime: null, items: [] },
  ]);

  // إعدادات إدارة الأجهزة الجديدة في صفحة الإعدادات
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('Single');
  const [newDevStatus, setNewDevStatus] = useState('available');
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editDevName, setEditDevName] = useState('');
  const [editDevType, setEditDevType] = useState('Single');
  const [editDevStatus, setEditDevStatus] = useState('available');

  // 4. المنتجات والمشاريب من Firestore
  const [products, setProducts] = useState([]);

  // حالات إضافة منتج جديد
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');

  // 5. النوافذ المؤقتة والمعاينة (Checkout & Preview)
  const [checkoutDevice, setCheckoutDevice] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // حالة معاينة تفاصيل الفاتورة عند الضغط عليها في الوردية
  const [selectedInvoicePreview, setSelectedInvoicePreview] = useState(null);

  const [addingItemDevice, setAddingItemDevice] = useState(null);
  const [startingDeviceModal, setStartingDeviceModal] = useState(null);
  const [selectedStartType, setSelectedStartType] = useState('Single');

  // 6. الوردية الحالية والمصروفات والأرشيف
  const [shiftInvoices, setShiftInvoices] = useState([]);
  const [shiftNumber, setShiftNumber] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [archivedShifts, setArchivedShifts] = useState([]);
  
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 7. حالات لوحة تحكم المستخدمين الجدد والصلاحيات
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newPerms] = useState({
    ps: true, drinks: true, expenses: true, shift: true, archive: true, users: false, settings: false
  });

  // جلب البيانات المباشرة من Firestore عند فتح التطبيق
  useEffect(() => {
    const unsubDevices = onSnapshot(collection(db, "ps_devices"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDevices(list);
      }
    });

    const unsubProducts = onSnapshot(collection(db, "ps_products"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });

    const unsubUsers = onSnapshot(collection(db, "ps_users"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsersList(list);
      } else {
        const defaultAdmin = { username: 'zead', password: '123', role: 'admin', fullName: 'المدير العام (Zead)', permissions: { ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true } };
        setDoc(doc(db, "ps_users", "admin_default"), defaultAdmin);
      }
    });

    const unsubSettings = onSnapshot(collection(db, "ps_settings"), (snapshot) => {
      if (!snapshot.empty) {
        setSettings(snapshot.docs[0].data());
      }
    });

    const unsubInvoices = onSnapshot(collection(db, "ps_shift_invoices"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShiftInvoices(list);
    });

    const unsubExpenses = onSnapshot(collection(db, "ps_expenses"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(list);
    });

    const unsubArchive = onSnapshot(collection(db, "ps_archived_shifts"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArchivedShifts(list);
    });

    return () => {
      unsubDevices();
      unsubProducts();
      unsubUsers();
      unsubSettings();
      unsubInvoices();
      unsubExpenses();
      unsubArchive();
    };
  }, []);

  // دالة لتنسيق الوقت بصيغة إنجليزية مع ص / م بالعربي
  const formatTimeWithAMPM = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // الساعة 12
    return `${hours}:${minutes} ${ampm}`;
  };

  const getDeviceSeconds = (dev) => {
    if (dev.status !== 'busy' || !dev.startTime) return 0;
    const now = Date.now();
    const diffSecs = Math.floor((now - dev.startTime) / 1000);
    return diffSecs > 0 ? diffSecs : 0;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDevices(prev => [...prev]);
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

  const confirmStartSession = async () => {
    if (!startingDeviceModal) return;
    const currentTimestamp = Date.now();
    const updatedDev = { ...startingDeviceModal, status: 'busy', type: selectedStartType, startTime: currentTimestamp, items: [] };
    
    await setDoc(doc(db, "ps_devices", String(startingDeviceModal.id)), updatedDev);
    setStartingDeviceModal(null);
    alert(`🚀 تم بدء الجلسة لجهاز ${startingDeviceModal.name} بنجاح!`);
  };

  const toggleDeviceTypeMidSession = async (dev) => {
    const nextType = dev.type === 'Single' ? 'Multi' : 'Single';
    const updatedDev = { ...dev, type: nextType };
    await setDoc(doc(db, "ps_devices", String(dev.id)), updatedDev);
    alert(`🔄 تم تحويل الجهاز إلى نوع (${nextType === 'Single' ? 'سنجل 👤' : 'ملتي 👥'}) بنجاح!`);
  };

  const addProductToDevice = async (dev, product) => {
    let updatedItems = [...dev.items];
    const existing = updatedItems.find(i => i.id === product.id);
    if (existing) {
      updatedItems = updatedItems.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      updatedItems.push({ ...product, qty: 1 });
    }
    const updatedDev = { ...dev, items: updatedItems };
    await setDoc(doc(db, "ps_devices", String(dev.id)), updatedDev);
    setAddingItemDevice(null);
    alert(`🥤 تمت إضافة "${product.name}" بنجاح إلى ${dev.name}!`);
  };

  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    await addDoc(collection(db, "ps_products"), {
      name: newProdName,
      price: Number(newProdPrice)
    });
    setNewProdName('');
    setNewProdPrice('');
    setShowAddProductModal(false);
    alert('✅ تم إضافة المنتج بنجاح إلى القائمة وقاعدة البيانات!');
  };

  const handleDeleteProduct = async (id) => {
    await deleteDoc(doc(db, "ps_products", String(id)));
    alert('🗑️ تم حذف المنتج بنجاح.');
  };

  const prepareCheckout = (dev) => {
    setCheckoutDevice(dev);
    setSelectedPaymentMethod(settings.paymentMethods[0] || 'كاش (Cash)');
    setDiscountAmount('');
    setShowPreviewModal(true);
  };

  const finalizeCheckout = async () => {
    if (!checkoutDevice) return;
    const activeSecs = getDeviceSeconds(checkoutDevice);
    const pricePerHour = checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice;
    const timeCost = Math.round((activeSecs / 3600) * pricePerHour);
    const itemsCost = checkoutDevice.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subTotal = timeCost + itemsCost;
    const discount = discountAmount !== '' ? Number(discountAmount) : 0;
    const totalAmount = Math.max(0, subTotal - discount);

    const invoiceData = {
      deviceName: checkoutDevice.name,
      date: new Date().toISOString().split('T')[0],
      type: checkoutDevice.type === 'Single' ? 'سنجل' : 'ملتي',
      timeSpent: formatTime(activeSecs),
      timeCost,
      items: checkoutDevice.items,
      itemsCost,
      discount,
      total: totalAmount,
      paymentMethod: selectedPaymentMethod || settings.paymentMethods[0],
      time: new Date().toLocaleTimeString('ar-EG')
    };

    await addDoc(collection(db, "ps_shift_invoices"), invoiceData);
    await setDoc(doc(db, "ps_devices", String(checkoutDevice.id)), { ...checkoutDevice, status: 'available', startTime: null, items: [] });
    
    setShowPreviewModal(false);
    setCheckoutDevice(null);
    alert(`💳 تم إغلاق فاتورة ${checkoutDevice.name} ودفع الحساب بقيمة (${totalAmount} ج.م) بنجاح!`);
  };

  const closeShift = async () => {
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

    await addDoc(collection(db, "ps_archived_shifts"), shiftArchive);
    alert(`📁 تم إغلاق الوردية رقم ${shiftNumber} وأرشفتها بنجاح في السحابة!`);
    
    for (let inv of shiftInvoices) {
      await deleteDoc(doc(db, "ps_shift_invoices", inv.id));
    }
    for (let ex of expenses) {
      await deleteDoc(doc(db, "ps_expenses", ex.id));
    }
    setShiftNumber(prev => prev + 1);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newFullName) return;
    if (usersList.some(u => u.username === newUsername)) {
      alert('اسم المستخدم موجود مسبقاً!');
      return;
    }
    const newUser = {
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      role: newRole,
      permissions: newRole === 'admin' ? { ps: true, drinks: true, expenses: true, shift: true, archive: true, users: true, settings: true } : newPerms
    };
    await addDoc(collection(db, "ps_users"), newUser);
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewRole('user');
    alert('👤 تم إضافة المستخدم وصلاحياته بنجاح!');
  };

  const handleDeleteUser = async (id) => {
    if (usersList.length <= 1) {
      alert('لا يمكن حذف كل المستخدمين!');
      return;
    }
    await deleteDoc(doc(db, "ps_users", String(id)));
    alert('🗑️ تم حذف المستخدم بنجاح.');
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDevName) return;
    const newId = String(Date.now());
    const newDevice = {
      name: newDevName,
      type: newDevType,
      status: newDevStatus,
      startTime: null,
      items: []
    };
    await setDoc(doc(db, "ps_devices", newId), newDevice);
    setNewDevName('');
    alert('🎮 تم إضافة الجهاز بنجاح للقاعدة!');
  };

  const handleDeleteDevice = async (id) => {
    if (devices.length <= 1) {
      alert('لا يمكن حذف كل الأجهزة!');
      return;
    }
    await deleteDoc(doc(db, "ps_devices", String(id)));
    alert('🗑️ تم حذف الجهاز بنجاح.');
  };

  const handleUpdateDevice = async (dev) => {
    const updated = {
      ...dev,
      name: editDevName || dev.name,
      type: editDevType,
      status: editDevStatus
    };
    await setDoc(doc(db, "ps_devices", String(dev.id)), updated);
    setEditingDeviceId(null);
    alert('✨ تم تحديث بيانات الجهاز بنجاح!');
  };

  const totalRevenue = shiftInvoices.reduce((s, inv) => s + inv.total, 0);
  const totalExpenses = expenses.reduce((s, ex) => s + ex.amount, 0);
  const netRevenue = totalRevenue - totalExpenses;

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
              🥤 مبيعات الكافتيريا والمشاريب
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
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>قاعدة بيانات سحابية متصلة بالكامل (Firebase)</p>
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
                const activeSecs = getDeviceSeconds(dev);
                const pricePerHour = dev.type === 'Single' ? settings.singlePrice : settings.multiPrice;
                const timeCost = Math.round((activeSecs / 3600) * pricePerHour);
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
                        <button onClick={async () => {
                          await setDoc(doc(db, "ps_devices", String(dev.id)), { ...dev, status: 'available' });
                          alert(`✅ تم إعادة جهاز ${dev.name} للخدمة بنجاح!`);
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
                        {formatTime(activeSecs)}
                      </div>
                      
                      {/* وقت الفتح: تم توضيحه ونقله لليمين بصيغة إنجليزية و ص/م */}
                      {dev.status === 'busy' && dev.startTime && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', marginBottom: '10px', background: 'rgba(56,189,248,0.08)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                          <span>🕒 فتح الساعة:</span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '13px', direction: 'ltr' }}>{formatTimeWithAMPM(dev.startTime)}</strong>
                        </div>
                      )}

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
                        <button onClick={() => toggleDeviceTypeMidSession(dev)} style={{ width: '100%', padding: '9px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
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

        {/* قسم مبيعات الكافتيريا والمشاريب */}
        {activeTab === 'drinks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '5px' }}>مبيعات الكافتيريا والمشاريب</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>إدارة قائمة المشروبات وعمليات البيع السريع</p>
              </div>
              
              <button onClick={() => setShowAddProductModal(true)} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 15px rgba(2,132,199,0.3)' }}>
                ➕ إضافة منتج جديد
              </button>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px' }}>المنتجات المتاحة حالياً</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
              {products.map(p => (
                <div key={p.id} className="neon-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '5px', fontSize: '16px' }}>{p.name}</h3>
                    <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px', margin: 0 }}>{p.price} ج.م</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button onClick={async () => {
                      const inv = { deviceName: 'مبيعات كافتيريا', date: new Date().toISOString().split('T')[0], type: 'مبيعات خارجية', timeSpent: '-', timeCost: 0, items: [{...p, qty: 1}], itemsCost: p.price, discount: 0, total: p.price, paymentMethod: settings.paymentMethods[0] || 'كاش', time: new Date().toLocaleTimeString('ar-EG') };
                      await addDoc(collection(db, "ps_shift_invoices"), inv);
                      alert(`✅ تم بيع "${p.name}" بنجاح وتسجيل الفاتورة في الوردية والسحابة!`);
                    }} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>بيع سريع ⚡</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>حذف 🗑️</button>
                  </div>
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
              <button onClick={async () => {
                if(!expTitle || !expAmount) return;
                await addDoc(collection(db, "ps_expenses"), { title: expTitle, amount: Number(expAmount) });
                setExpTitle(''); setExpAmount('');
                alert('💸 تم تسجيل المصروف بنجاح في قاعدة البيانات!');
              }} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>إضافة مصروف 💸</button>
            </div>
          </div>
        )}

        {/* تقرير الوردية الحالية */}
        {activeTab === 'shift' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>تقرير الوردية الحالية (#{shiftNumber})</h1>
              <button onClick={closeShift} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                إغلاق وأرشفة الوردية 📁
              </button>
            </div>

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

            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>💳 تفصيل الإيرادات حسب طريقة الدفع</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {settings.paymentMethods.map(method => (
                  <div key={method} style={{ background: '#020408', padding: '15px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{method}</p>
                    <h4 style={{ margin: '5px 0 0 0', color: '#22c55e', fontSize: '18px' }}>{revenueByPayment[method] || 0} ج.م</h4>
                  </div>
                ))}
              </div>
            </div>

            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>قائمة فواتير الوردية الحالية</h3>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '15px' }}>💡 اضغط على أي فاتورة لعرض تفاصيلها الكاملة</p>
              
              {shiftInvoices.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>لا توجد فواتير مسجلة بعد في هذه الوردية.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
                        <th style={{ padding: '12px' }}>الجهاز / الصنف</th>
                        <th style={{ padding: '12px' }}>النوع</th>
                        <th style={{ padding: '12px' }}>الوقت / الكمية</th>
                        <th style={{ padding: '12px' }}>الإجمالي</th>
                        <th style={{ padding: '12px' }}>طريقة الدفع</th>
                        <th style={{ padding: '12px' }}>الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftInvoices.map(inv => (
                        <tr key={inv.id} onClick={() => setSelectedInvoicePreview(inv)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{inv.deviceName}</td>
                          <td style={{ padding: '12px' }}>{inv.type}</td>
                          <td style={{ padding: '12px', fontFamily: 'monospace' }}>{inv.timeSpent}</td>
                          <td style={{ padding: '12px', color: '#22c55e', fontWeight: '900' }}>{inv.total} ج.م</td>
                          <td style={{ padding: '12px' }}>{inv.paymentMethod}</td>
                          <td style={{ padding: '12px', color: '#94a3b8', fontSize: '12px' }}>{inv.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* الأرشيف */}
        {activeTab === 'archive' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '15px' }}>📂 أرشيف الورديات والتقارير</h1>
            <div className="neon-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#38bdf8', marginBottom: '5px' }}>من تاريخ</label>
                <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{ padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#38bdf8', marginBottom: '5px' }}>إلى تاريخ</label>
                <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{ padding: '10px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
              </div>
              <button onClick={()=>{setFromDate(''); setToDate('');}} style={{ marginTop: '18px', padding: '10px 15px', background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>إعادة ضبط الفلتر</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>إجمالي الإيرادات</p>
                <h3 style={{ color: '#38bdf8', fontSize: '22px', marginTop: '5px' }}>{filteredTotalRev} ج.م</h3>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>إجمالي المصروفات</p>
                <h3 style={{ color: '#ef4444', fontSize: '22px', marginTop: '5px' }}>{filteredTotalExp} ج.م</h3>
              </div>
              <div className="neon-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>صافي الأرباح</p>
                <h3 style={{ color: '#22c55e', fontSize: '22px', marginTop: '5px' }}>{filteredNetRev} ج.م</h3>
              </div>
            </div>

            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>الورديات المؤرشفة السابقة</h3>
              {filteredShifts.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>لا توجد ورديات مؤرشفة في النطاق المحدد.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {filteredShifts.map(sh => (
                    <div key={sh.id} style={{ background: '#020408', padding: '20px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '16px' }}>وردية رقم #{sh.shiftNumber} ({sh.date})</h4>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>المسؤول: {sh.cashier}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
                        <span>الإيرادات: <strong style={{ color: '#38bdf8' }}>{sh.totalRevenue} ج.م</strong></span>
                        <span>المصروفات: <strong style={{ color: '#ef4444' }}>{sh.totalExpenses} ج.م</strong></span>
                        <span>الصافي: <strong style={{ color: '#22c55e' }}>{sh.netRevenue} ج.م</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* إدارة المستخدمين */}
        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>👥 إدارة المستخدمين والصلاحيات</h1>
            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px', maxWidth: '600px', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '15px' }}>➕ إضافة موظف جديد</h3>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" value={newUsername} onChange={e=>setNewUsername(e.target.value)} placeholder="اسم المستخدم للدخول" style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="كلمة المرور" style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                <input type="text" value={newFullName} onChange={e=>setNewFullName(e.target.value)} placeholder="الاسم بالكامل (مثال: موظف الشفت الصباحي)" style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
                <select value={newRole} onChange={e=>setNewRole(e.target.value)} style={{ padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }}>
                  <option value="user">موظف (صلاحيات مخصصة)</option>
                  <option value="admin">أدمن عام (صلاحيات كاملة)</option>
                </select>
                <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ وإضافة الموظف</button>
              </form>
            </div>

            <div className="neon-card" style={{ padding: '25px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>المستخدمين المسجلين في النظام</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {usersList.map(u => (
                  <div key={u.id} style={{ background: '#020408', padding: '18px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{u.fullName} ({u.username})</h4>
                      <span style={{ fontSize: '12px', color: u.role === 'admin' ? '#22c55e' : '#f59e0b' }}>{u.role === 'admin' ? 'مدير عام' : 'موظف'}</span>
                    </div>
                    {u.username !== 'zead' && (
                      <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '8px 15px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>حذف المستخدم</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* الإعدادات العامة وإدارة أجهزة البلايستيشن */}
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
                    <input type="number" value={settings.singlePrice} onChange={async e=>{
                      const updated = {...settings, singlePrice: Number(e.target.value)};
                      setSettings(updated);
                      await setDoc(doc(db, "ps_settings", "general_settings"), updated);
                    }} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>سعر الملتي (ج.م / ساعة)</label>
                    <input type="number" value={settings.multiPrice} onChange={async e=>{
                      const updated = {...settings, multiPrice: Number(e.target.value)};
                      setSettings(updated);
                      await setDoc(doc(db, "ps_settings", "general_settings"), updated);
                    }} style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} />
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

            {/* إدارة وتعديل الأجهزة الحالية */}
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
                          <option value="available">متاح</option>
                          <option value="maintenance">في الصيانة</option>
                        </select>
                        <button onClick={() => handleUpdateDevice(d)} style={{ padding: '8px 15px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                        <button onClick={() => setEditingDeviceId(null)} style={{ padding: '8px 15px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{d.name}</h4>
                          <span style={{ fontSize: '12px', color: '#38bdf8' }}>({d.type === 'Single' ? 'سنجل' : 'ملتي'})</span>
                          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '10px', background: d.status === 'maintenance' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: d.status === 'maintenance' ? '#ef4444' : '#22c55e' }}>
                            {d.status === 'maintenance' ? 'في الصيانة' : 'شغال / متاح'}
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

      {/* نافذة منبثقة (Modal) لإضافة منتج جديد */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(3,5,10,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'right' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8', marginBottom: '15px', textAlign: 'center' }}>➕ إضافة منتج جديد</h3>
            <form onSubmit={handleAddNewProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>اسم المنتج أو المشروب</label>
                <input type="text" value={newProdName} onChange={e=>setNewProdName(e.target.value)} placeholder="مثال: عصير مانجو، كوفي..." style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>السعر (ج.م)</label>
                <input type="number" value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} placeholder="0" style={{ width: '100%', padding: '12px', background: '#020408', border: '1px solid rgba(56,189,248,0.3)', color: '#fff', borderRadius: '10px', outline: 'none' }} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ وإضافة ✅</button>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={{ padding: '12px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة بدء جلسة */}
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
                <button key={p.id} onClick={() => addProductToDevice(addingItemDevice, p)} style={{ padding: '12px', background: '#020408', color: '#fff', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                  <span>{p.name}</span>
                  <span style={{ color: '#22c55e' }}>{p.price} ج.م</span>
                </button>
              ))}
            </div>
            <button onClick={() => setAddingItemDevice(null)} style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة معاينة الفاتورة وإنهاء الحساب والدفع (مع دعم مفتاح Enter) */}
      {showPreviewModal && checkoutDevice && (
        <div 
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              finalizeCheckout();
            }
          }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(3,5,10,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px', outline: 'none' }}
          ref={(node) => node && node.focus()}
        >
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '450px', textAlign: 'right', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#38bdf8', marginBottom: '15px', textAlign: 'center' }}>🧾 فاتورة الحساب النهائية</h3>
            
            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>الجهاز:</span>
                <strong>{checkoutDevice.name} ({checkoutDevice.type === 'Single' ? 'سنجل' : 'ملتي'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>وقت اللعب:</span>
                <strong style={{ fontFamily: 'monospace' }}>{formatTime(getDeviceSeconds(checkoutDevice))}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>تكلفة الوقت:</span>
                <strong style={{ color: '#22c55e' }}>{Math.round((getDeviceSeconds(checkoutDevice) / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice))} ج.م</strong>
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
                {Math.max(0, Math.round((getDeviceSeconds(checkoutDevice) / 3600) * (checkoutDevice.type === 'Single' ? settings.singlePrice : settings.multiPrice)) + checkoutDevice.items.reduce((s, i) => s + (i.price * i.qty), 0) - (discountAmount !== '' ? Number(discountAmount) : 0))} ج.م
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={finalizeCheckout} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد الدفع وإغلاق الفاتورة (Enter) ✅</button>
              <button onClick={() => setShowPreviewModal(false)} style={{ padding: '12px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة منبثقة لمعاينة تفاصيل الفاتورة عند النقر عليها في جدول الوردية */}
      {selectedInvoicePreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(3,5,10,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div className="neon-card" style={{ padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '450px', textAlign: 'right', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8', marginBottom: '15px', textAlign: 'center' }}>📄 تفاصيل الفاتورة</h3>

            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>الجهاز / الصنف:</span>
                <strong>{selectedInvoicePreview.deviceName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>نوع اللعب:</span>
                <strong>{selectedInvoicePreview.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>وقت اللعب المستغرق:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedInvoicePreview.timeSpent}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>تكلفة الوقت:</span>
                <strong style={{ color: '#22c55e' }}>{selectedInvoicePreview.timeCost || 0} ج.م</strong>
              </div>
            </div>

            {selectedInvoicePreview.items && selectedInvoicePreview.items.length > 0 && (
              <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)' }}>
                <h4 style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '8px' }}>المشاريب والطلبات المضافة:</h4>
                {selectedInvoicePreview.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                    <span>{item.name} (×{item.qty})</span>
                    <span>{item.price * item.qty} ج.م</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>الخصم:</span>
                <strong style={{ color: '#ef4444' }}>{selectedInvoicePreview.discount || 0} ج.م</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>طريقة الدفع:</span>
                <strong>{selectedInvoicePreview.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>وقت إصدار الفاتورة:</span>
                <span style={{ color: '#94a3b8' }}>{selectedInvoicePreview.time}</span>
              </div>
            </div>

            <div style={{ background: '#020408', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>الإجمالي المدفوع:</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#22c55e', marginTop: '5px' }}>
                {selectedInvoicePreview.total} ج.م
              </div>
            </div>

            <button onClick={() => setSelectedInvoicePreview(null)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إغلاق النافذة</button>
          </div>
        </div>
      )}

    </div>
  );
}