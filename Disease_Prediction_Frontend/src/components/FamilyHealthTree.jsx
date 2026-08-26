import React, { useState } from 'react';
import { Users, Plus, Heart, Activity, Droplet, AlertCircle, TrendingUp, Edit2, Trash2, UserPlus } from 'lucide-react';

export default function FamilyHealthTree({ patientId, theme = 'light' }) {
  const isDark = theme === 'dark';

  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: 'John Doe (Patient)',
      relation: 'self',
      age: 52,
      gender: 'Male',
      conditions: ['Type 2 Diabetes', 'Hypertension'],
      riskScore: 68,
      isPatient: true
    },
    {
      id: 2,
      name: 'Mary Doe',
      relation: 'mother',
      age: 78,
      gender: 'Female',
      conditions: ['Type 2 Diabetes', 'Heart Disease', 'Stroke'],
      riskScore: 85,
      deceased: false
    },
    {
      id: 3,
      name: 'Robert Doe',
      relation: 'father',
      age: 80,
      gender: 'Male',
      conditions: ['Hypertension', 'Heart Disease'],
      riskScore: 82,
      deceased: false
    },
    {
      id: 4,
      name: 'Sarah Doe',
      relation: 'sister',
      age: 48,
      gender: 'Female',
      conditions: ['Hypertension'],
      riskScore: 45,
      deceased: false
    },
    {
      id: 5,
      name: 'Emily Doe',
      relation: 'daughter',
      age: 25,
      gender: 'Female',
      conditions: [],
      riskScore: 15,
      deceased: false
    },
    {
      id: 6,
      name: 'Michael Doe',
      relation: 'son',
      age: 22,
      gender: 'Male',
      conditions: [],
      riskScore: 12,
      deceased: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: 'parent',
    age: '',
    gender: 'Male',
    conditions: [],
    deceased: false
  });

  // Calculate genetic risk based on family history
  const calculateGeneticRisk = () => {
    const conditions = {};
    
    familyMembers.forEach(member => {
      if (member.relation !== 'self') {
        member.conditions.forEach(condition => {
          if (!conditions[condition]) {
            conditions[condition] = {
              count: 0,
              relations: [],
              inheritanceRisk: 0
            };
          }
          conditions[condition].count++;
          conditions[condition].relations.push(member.relation);
          
          // Calculate inheritance risk based on relation
          const riskFactor = {
            'parent': 0.3,
            'mother': 0.3,
            'father': 0.3,
            'sibling': 0.25,
            'brother': 0.25,
            'sister': 0.25,
            'child': 0.15,
            'son': 0.15,
            'daughter': 0.15,
            'grandparent': 0.15,
            'aunt/uncle': 0.1,
            'cousin': 0.05
          };
          
          conditions[condition].inheritanceRisk += (riskFactor[member.relation] || 0.1);
        });
      }
    });

    return Object.entries(conditions)
      .map(([condition, data]) => ({
        condition,
        prevalence: data.count,
        relations: [...new Set(data.relations)],
        inheritanceRisk: Math.min(data.inheritanceRisk * 100, 100)
      }))
      .sort((a, b) => b.inheritanceRisk - a.inheritanceRisk);
  };

  const geneticRisks = calculateGeneticRisk();

  const getRelationIcon = (relation) => {
    const relationMap = {
      'self': '👤',
      'mother': '👩',
      'father': '👨',
      'parent': '👪',
      'sister': '👧',
      'brother': '👦',
      'sibling': '👫',
      'daughter': '👧',
      'son': '👦',
      'child': '👶',
      'grandmother': '👵',
      'grandfather': '👴',
      'grandparent': '👴'
    };
    return relationMap[relation] || '👤';
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 70) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-900';
    if (riskScore >= 50) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900';
    if (riskScore >= 30) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';
    return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-900';
  };

  const commonConditions = ['Type 2 Diabetes', 'Heart Disease', 'Hypertension', 'Stroke', 'Cancer', 'Kidney Disease', 'Alzheimer\'s'];

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Family Health Tree
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Genetic risk assessment & family medical history
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            Add Family Member
          </button>
        </div>
      </div>

      {/* Genetic Risk Summary */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-[#0F172A]'
        }`}>
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Inherited Risk Assessment
        </h4>
        
        {geneticRisks.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            No family medical history recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {geneticRisks.map((risk, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border ${
                  risk.inheritanceRisk >= 50 
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                    : risk.inheritanceRisk >= 30
                    ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {risk.condition}
                  </h5>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      risk.inheritanceRisk >= 50 
                        ? 'text-red-600 dark:text-red-400'
                        : risk.inheritanceRisk >= 30
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {risk.inheritanceRisk.toFixed(0)}%
                    </div>
                    <div className={`text-[10px] font-semibold uppercase ${
                      isDark ? 'text-slate-400' : 'text-[#64748B]'
                    }`}>
                      Inherited Risk
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    Affected:
                  </span>
                  {risk.relations.map((rel, i) => (
                    <span 
                      key={i}
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        isDark 
                          ? 'bg-[#1E293B] text-slate-300' 
                          : 'bg-white text-[#0F172A] border border-[#E2E8F0]'
                      }`}
                    >
                      {rel}
                    </span>
                  ))}
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${
                    isDark 
                      ? 'bg-[#1E293B] text-slate-300' 
                      : 'bg-slate-100 text-[#64748B]'
                  }`}>
                    {risk.prevalence} relative{risk.prevalence > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyMembers.map(member => (
          <div 
            key={member.id}
            className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
              member.isPatient
                ? isDark 
                  ? 'bg-blue-950/30 border-blue-900 ring-2 ring-blue-600' 
                  : 'bg-blue-50 border-blue-200 ring-2 ring-blue-400'
                : isDark 
                  ? 'bg-[#0F172A] border-[#1E293B]' 
                  : 'bg-white border-[#E2E8F0] shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {getRelationIcon(member.relation)}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {member.name}
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {member.relation.charAt(0).toUpperCase() + member.relation.slice(1)} • {member.age} yrs • {member.gender}
                  </p>
                </div>
              </div>
              {!member.isPatient && (
                <button className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Risk Score */}
            <div className={`p-3 rounded-lg border mb-3 ${getRiskColor(member.riskScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Health Risk Score</span>
                <span className="text-lg font-bold">{member.riskScore}%</span>
              </div>
              <div className="w-full bg-white/30 dark:bg-black/20 rounded-full h-1.5 mt-2">
                <div 
                  className="h-1.5 rounded-full bg-current"
                  style={{ width: `${member.riskScore}%` }}
                ></div>
              </div>
            </div>

            {/* Conditions */}
            {member.conditions.length > 0 ? (
              <div>
                <h5 className={`text-xs font-semibold mb-2 ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Medical Conditions:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {member.conditions.map((condition, idx) => (
                    <span 
                      key={idx}
                      className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        isDark 
                          ? 'bg-red-950/30 text-red-400 border border-red-900' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No known conditions
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add Family Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 ${
            isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Add Family Member
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Name *
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-[#1E293B] border-[#334155] text-white' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Relation *
                  </label>
                  <select
                    value={newMember.relation}
                    onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark 
                        ? 'bg-[#1E293B] border-[#334155] text-white' 
                        : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  >
                    <option value="parent">Parent</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="sibling">Sibling</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="child">Child</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="aunt/uncle">Aunt/Uncle</option>
                    <option value="cousin">Cousin</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-semibold mb-1 block ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Age *
                  </label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark 
                        ? 'bg-[#1E293B] border-[#334155] text-white' 
                        : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Gender *
                </label>
                <select
                  value={newMember.gender}
                  onChange={(e) => setNewMember({...newMember, gender: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-[#1E293B] border-[#334155] text-white' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-2 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Medical Conditions
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {commonConditions.map(condition => (
                    <label key={condition} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMember.conditions.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewMember({...newMember, conditions: [...newMember.conditions, condition]});
                          } else {
                            setNewMember({...newMember, conditions: newMember.conditions.filter(c => c !== condition)});
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                        {condition}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const member = {
                    ...newMember,
                    id: Date.now(),
                    riskScore: Math.floor(Math.random() * 50) + 20,
                    deceased: false
                  };
                  setFamilyMembers([...familyMembers, member]);
                  setShowAddForm(false);
                  setNewMember({
                    name: '',
                    relation: 'parent',
                    age: '',
                    gender: 'Male',
                    conditions: [],
                    deceased: false
                  });
                }}
                disabled={!newMember.name || !newMember.age}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isDark 
                    ? 'bg-[#1E293B] text-slate-200 hover:bg-[#334155]' 
                    : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0]'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
