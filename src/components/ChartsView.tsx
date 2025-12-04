import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Income {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  clientName: string;
  date: string;
}

interface Expense {
  id: string;
  productId: string;
  productName: string;
  providerId: string;
  providerName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

export function ChartsView() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load sales (new format) or incomes (old format)
    const storedSales = localStorage.getItem('ministock_sales');
    const storedIncomes = localStorage.getItem('ministock_incomes');
    
    if (storedSales) {
      // Convert new multi-product sales to old format for charts compatibility
      const sales = JSON.parse(storedSales);
      const flattenedIncomes: Income[] = [];
      sales.forEach((sale: any) => {
        sale.items.forEach((item: any) => {
          flattenedIncomes.push({
            id: `${sale.id}-${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.subtotal,
            clientName: sale.clientName,
            date: sale.date,
          });
        });
      });
      setIncomes(flattenedIncomes);
    } else if (storedIncomes) {
      setIncomes(JSON.parse(storedIncomes));
    }

    // Load purchases (new format) or expenses (old format)
    const storedPurchases = localStorage.getItem('ministock_purchases');
    const storedExpenses = localStorage.getItem('ministock_expenses');
    
    if (storedPurchases) {
      // Convert new multi-product purchases to old format for charts compatibility
      const purchases = JSON.parse(storedPurchases);
      const flattenedExpenses: Expense[] = [];
      purchases.forEach((purchase: any) => {
        purchase.items.forEach((item: any) => {
          flattenedExpenses.push({
            id: `${purchase.id}-${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            providerId: purchase.providerId,
            providerName: purchase.providerName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.subtotal,
            date: purchase.date,
          });
        });
      });
      setExpenses(flattenedExpenses);
    } else if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  };

  // Calculate totals
  const totalIncomes = incomes.reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
  const balance = totalIncomes - totalExpenses;

  // Prepare data for charts
  const pieData = [
    { name: 'Ingresos', value: totalIncomes, color: '#00FFFF' },
    { name: 'Egresos', value: totalExpenses, color: '#0047AB' },
  ];

  // Group by month
  const monthlyData: { [key: string]: { incomes: number; expenses: number } } = {};
  
  incomes.forEach(income => {
    const month = new Date(income.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { incomes: 0, expenses: 0 };
    }
    monthlyData[month].incomes += income.total;
  });

  expenses.forEach(expense => {
    const month = new Date(expense.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { incomes: 0, expenses: 0 };
    }
    monthlyData[month].expenses += expense.total;
  });

  const lineData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ingresos: data.incomes,
    egresos: data.expenses,
    balance: data.incomes - data.expenses,
  }));

  // Top products
  const productSales: { [key: string]: number } = {};
  incomes.forEach(income => {
    if (!productSales[income.productName]) {
      productSales[income.productName] = 0;
    }
    productSales[income.productName] += income.total;
  });

  const topProductsData = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => ({ name, total }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#00FFFF]">
          <CardHeader className="bg-gradient-to-br from-[#00FFFF]/20 to-[#35D7FF]/20">
            <CardTitle className="text-[#0047AB]">Total Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl text-[#00FFFF]">${totalIncomes.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2">{incomes.length} ventas realizadas</p>
          </CardContent>
        </Card>

        <Card className="border-[#0047AB]">
          <CardHeader className="bg-gradient-to-br from-[#0047AB]/20 to-[#35D7FF]/20">
            <CardTitle className="text-[#0047AB]">Total Egresos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl text-[#0047AB]">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2">{expenses.length} compras realizadas</p>
          </CardContent>
        </Card>

        <Card className={`border-[#35D7FF] ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardHeader className="bg-gradient-to-br from-[#35D7FF]/20 to-[#00FFFF]/20">
            <CardTitle className="text-[#0047AB]">Balance General</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className={`text-3xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {balance >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="border-[#35D7FF]">
          <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
            <CardTitle>Distribución de Ingresos vs Egresos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Top Products */}
        <Card className="border-[#35D7FF]">
          <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
            <CardTitle>Top 5 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0047AB" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart - Monthly Trend */}
        <Card className="border-[#35D7FF] lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-[#0047AB] to-[#35D7FF] text-white">
            <CardTitle>Tendencia Mensual - Ingresos, Egresos y Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#00FFFF" strokeWidth={2} />
                  <Line type="monotone" dataKey="egresos" stroke="#0047AB" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" stroke="#35D7FF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
