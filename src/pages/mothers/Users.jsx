import React, { useMemo } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatNumberWithCommas } from "@/lib/utils";
import { useState } from "react";
import { useEffect } from "react";
import useApiReqs from "@/hooks/useApiReqs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Table from "@/components/Table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UsersTable from "./auxiliary/UsersTable";

export default function Users() {
    const navigate = useNavigate();

    const { fetchUsersThatHaveBooked } = useApiReqs()

    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState("All")

    useEffect(() => {
        fetchUsersThatHaveBooked({
            callBack: ({ bookedUsers }) => {
                setUsers(bookedUsers)
            }
        })
    }, [])

    /* -------------------------------- stats -------------------------------- */
    const stats = useMemo(() => {
        return {
            total: users.length,
            pregnant: users.filter(m => m.is_pregnant === true).length,
            postPartum: users.filter(m => m.is_pregnant === false).length,
            ttc: users.filter(m => m.is_pregnant === null).length,
        };
    }, [users]);

    const filteredUsers = users?.filter(u => {
        const { username, is_pregnant } = u

        const bySearch = 
            !searchTerm 
            ?
                true
            :
            searchTerm?.toLowerCase().includes(username?.toLowerCase())
            ||
            username?.toLowerCase().includes(searchTerm?.toLowerCase())

        const byFilter = 
            filter === 'All'
            ?
                true
            :
            filter === 'Pregnant'
            ?
                is_pregnant === true
            :
            filter === 'Post-Partum'
            ?
                is_pregnant === false
            :
            filter === 'TTC'
            ?
                is_pregnant === null
            :
                true

        return bySearch && byFilter
    })

    /* ----------------------------------------------------------------------- */
    return (
        <div className="space-y-6">

            {/* ------------------------------ Header ------------------------------ */}
            <section className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mothers</h1>
                    <p className="text-sm text-gray-500">
                        Manage and communicate with moms that have booked any of your service before
                    </p>
                </div>
            </section>

            {/* ------------------------------- Stats ------------------------------- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: stats.total },
                    { label: "Pregnant", value: stats.pregnant },
                    { label: "Post Partum", value: stats.postPartum },
                    { label: "TTC", value: stats.ttc },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="bg-white border rounded-2xl p-5 flex flex-col gap-1"
                    >
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold">
                            {formatNumberWithCommas(item.value)}
                        </p>
                    </div>
                ))}
            </section>

            <div className="bg-white rounded-2xl border">
                <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 pb-1 border-b-1">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-xl text-gray-900">Mothers</h2>
                        <p className="text-xs text-gray-400">See all moms who have booked at least 1 of your services before</p>
                    </div>

                    {/* ✅ Search & Filter Controls */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                        {/* Search Input */}
                        <Input
                            placeholder="Search by username"
                            className="w-full md:min-w-sm py-5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Filter Dropdown */}
                        <Select onValueChange={setFilter} defaultValue="All">
                            <SelectTrigger className="py-5">
                                <SelectValue placeholder="Filter by: All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                {
                                    ['Pregnant', 'Post-Partum', 'TTC'].map(s => {
                                        return (
                                            <SelectItem value={s} className={'capitalize'}> {s} </SelectItem>
                                        )
                                    })
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <UsersTable
                    users={filteredUsers}
                />
            </div>
        </div>
    );
}
