// import { Activity, ArrowUpRight, CheckCircle2, Clock3, Store, Users } from 'lucide-react';
// import { Card } from '../components/Card';
// import { useAuthStore } from '../stores/useAuthStore';

// const stats = [
//   {
//     label: 'Estado del sistema',
//     value: 'Operativo',
//     detail: 'Todos los servicios activos',
//     icon: Activity,
//   },
//   {
//     label: 'Tu rol',
//     value: 'Administrador',
//     detail: 'Acceso completo habilitado',
//     icon: CheckCircle2,
//   },
//   { label: 'Sesión', value: 'Activa', detail: 'Conexión segura', icon: Clock3 },
// ];

// export function DashboardPage() {
//   const usuario = useAuthStore((s) => s.usuario);

//   return (
//     <div className="space-y-7">
//       <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
//         <div>
//           <p className="mb-1 text-sm font-medium text-slate-500">Resumen general</p>
//           <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//             Hola, {usuario?.nombre}
//           </h1>
//           <p className="mt-2 text-sm text-slate-500">
//             Todo lo importante de tu tienda en un solo lugar.
//           </p>
//         </div>
//         <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
//           <span className="h-2 w-2 rounded-full bg-emerald-500" />
//           Sistema actualizado
//         </span>
//       </div>

//       <div className="grid gap-4 md:grid-cols-3">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={stat.label} className="p-5">
//               <div className="flex items-start justify-between">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
//                   <Icon size={20} />
//                 </div>
//                 <ArrowUpRight size={18} className="text-slate-300" />
//               </div>
//               <p className="mt-5 text-sm font-medium text-slate-500">{stat.label}</p>
//               <p className="mt-1 text-xl font-semibold text-slate-900">
//                 {stat.label === 'Tu rol' ? usuario?.rol : stat.value}
//               </p>
//               <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
//             </Card>
//           );
//         })}
//       </div>

//       <div className="grid gap-4 lg:grid-cols-5">
//         <Card
//           className="lg:col-span-3"
//           title="Actividad reciente"
//           description="Últimos movimientos registrados en el sistema"
//         >
//           <div className="divide-y divide-slate-100 px-5 sm:px-6">
//             {[
//               { icon: Users, title: 'Gestión de usuarios disponible', time: 'Ahora' },
//               { icon: Store, title: 'Tienda configurada correctamente', time: 'Hoy' },
//               { icon: CheckCircle2, title: 'Cuenta verificada', time: 'Reciente' },
//             ].map((item) => {
//               const Icon = item.icon;
//               return (
//                 <div key={item.title} className="flex items-center gap-4 py-4">
//                   <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
//                     <Icon size={17} />
//                   </span>
//                   <div className="min-w-0 flex-1">
//                     <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
//                     <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>

//         <Card className="bg-slate-900 p-6 text-white lg:col-span-2">
//           <p className="text-sm font-medium text-slate-300">Acceso rápido</p>
//           <h2 className="mt-2 text-xl font-semibold">Administra tu equipo</h2>
//           <p className="mt-2 text-sm leading-6 text-slate-400">
//             Crea operadores y gestiona sus accesos desde el módulo de usuarios.
//           </p>
//           <div className="mt-8 flex -space-x-2">
//             {[usuario?.nombre, 'OP', 'US'].map((name) => (
//               <span
//                 key={name}
//                 className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-xs font-semibold"
//               >
//                 {name?.slice(0, 2).toUpperCase()}
//               </span>
//             ))}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
