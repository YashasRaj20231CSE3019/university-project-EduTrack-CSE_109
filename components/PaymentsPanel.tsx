import React, { useState, useMemo } from 'react';
import { User, Student } from '../types';
import { CreditCard, Wallet, Building2, CheckCircle2, AlertCircle, Phone, Mail, Search, IndianRupee, Receipt, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentsPanelProps {
  user: User;
  students: Student[];
}

export const PaymentsPanel: React.FC<PaymentsPanelProps> = ({ user, students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'netbanking' | 'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Generate mock payment data for all students
  const mockPayments = useMemo(() => {
    return students.map((student, index) => {
      const totalFee = 300000;
      // Deterministic mock data based on index
      const status = index % 3 === 0 ? 'paid' : index % 3 === 1 ? 'partial' : 'due';
      const amountPaid = status === 'paid' ? totalFee : status === 'partial' ? 150000 : 0;
      const amountDue = totalFee - amountPaid;
      
      return {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        parentContact: student.parentContact || {
          name: `Parent of ${student.name}`,
          phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
          email: `parent${index}@example.com`
        },
        status,
        amountDue,
        amountPaid,
        totalFee,
        lastPaymentDate: status !== 'due' ? new Date(Date.now() - Math.random() * 10000000000).toISOString() : undefined
      };
    });
  }, [students]);

  const filteredPayments = mockPayments.filter(p => 
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = mockPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalDue = mockPayments.reduce((sum, p) => sum + p.amountDue, 0);
  const fullyPaidCount = mockPayments.filter(p => p.status === 'paid').length;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
    }, 1500);
  };

  if (user.role === 'student') {
    const myPayment = mockPayments.find(p => p.studentId === user.studentData?.id) || mockPayments[0];

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Fee Payment</h1>
          <p className="text-slate-500 font-medium">Manage your institution fees and payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Receipt className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Current Dues</h3>
              <div className="text-4xl font-black text-slate-900 mb-2">₹{myPayment.amountDue.toLocaleString('en-IN')}</div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {myPayment.amountDue === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> All fees paid</span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Payment pending</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Fee Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tuition Fee</span>
                  <span className="font-medium text-slate-900">₹2,50,000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Library Fee</span>
                  <span className="font-medium text-slate-900">₹25,000</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Activities</span>
                  <span className="font-medium text-slate-900">₹25,000</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                  <span>Total Fee</span>
                  <span>₹{myPayment.totalFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Amount Paid</span>
                  <span>-₹{myPayment.amountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Make a Payment</h2>
              </div>
              
              {paymentSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                  <p className="text-slate-500 font-medium">Your fee payment has been processed successfully. A receipt has been sent to your email.</p>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="p-6 space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Select Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                      >
                        <Wallet className="w-8 h-8" />
                        <span className="font-bold text-sm">UPI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'netbanking' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                      >
                        <Building2 className="w-8 h-8" />
                        <span className="font-bold text-sm">Net Banking</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                      >
                        <CreditCard className="w-8 h-8" />
                        <span className="font-bold text-sm">Card</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="w-48 h-48 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-sm p-4">
                          <QRCodeSVG 
                            value={`upi://pay?pa=yashasrajvideos@okhdfcbank&pn=EduTrack&am=${myPayment.amountDue}&cu=INR`}
                            size={160}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-sm font-bold text-slate-700 text-center">Scan with any UPI app to pay</p>
                        <p className="text-xs text-slate-500 mt-1">GPay, PhonePe, Paytm, etc.</p>
                      </div>
                      
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">OR ENTER UPI ID</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">UPI ID</label>
                        <input type="text" placeholder="username@bank" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-in fade-in">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                          <input type="text" placeholder="123" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4 animate-in fade-in">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Bank</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required>
                          <option value="">Choose a bank...</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isProcessing || myPayment.amountDue === 0}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <IndianRupee className="w-5 h-5" />
                          Pay ₹{myPayment.amountDue.toLocaleString('en-IN')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher View
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Fee Management</h1>
          <p className="text-slate-500 font-medium">Overview of student payments and dues</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Collected</p>
            <p className="text-2xl font-black text-slate-900">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Due</p>
            <p className="text-2xl font-black text-slate-900">₹{totalDue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fully Paid</p>
            <p className="text-2xl font-black text-slate-900">{fullyPaidCount} <span className="text-sm font-medium text-slate-500">/ {students.length}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Parent Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.studentId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{payment.studentName}</div>
                    <div className="text-xs font-medium text-slate-500">Section {payment.grade}</div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'paid' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Paid</span>}
                    {payment.status === 'partial' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-bold"><AlertCircle className="w-3 h-3" /> Partial</span>}
                    {payment.status === 'due' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 text-xs font-bold"><AlertCircle className="w-3 h-3" /> Due</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">₹{payment.amountDue.toLocaleString('en-IN')}</div>
                    {payment.lastPaymentDate && (
                      <div className="text-xs font-medium text-slate-500">Last paid: {new Date(payment.lastPaymentDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{payment.parentContact.name}</div>
                    <div className="flex flex-col gap-1 mt-1">
                      <a href={`tel:${payment.parentContact.phone}`} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                        <Phone className="w-3 h-3" /> {payment.parentContact.phone}
                      </a>
                      <a href={`mailto:${payment.parentContact.email}`} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                        <Mail className="w-3 h-3" /> {payment.parentContact.email}
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
